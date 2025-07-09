import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import hashlib
import os
from io import StringIO
import datetime
import requests
import json

#-----Configuracion-----
csv_URL = "https://docs.google.com/spreadsheets/d/1fqQ2oNTTH7fQp2ExGtARtsdkNd0xKXDKuZcwzu09pqI/export?format=csv"
HASH_FILE = os.path.join("state", "last_hash.txt")
OUTPUT_DIR = os.path.join("..", "..", "public", "data")  # Ruta relativa desde src/python/
LOG_FILE = os.path.join("state", "generator.log")

#-----UTILS-----
def get_sheet_content(): #Obtención de las respuestas del form
    response = requests.get(csv_URL)
    response.raise_for_status() #Control de errores HTTP
    return response.content

#Cálculo del hash actual
def compute_hash(content):
    return hashlib.sha256(content).hexdigest()

#Lectura fichero con Hash almacenado
def read_last_hash():
    if not os.path.exists(HASH_FILE):
        print("No hay hash previo guardado.")
        return None
    with open(HASH_FILE, "r") as f:
        print("Último hash:", f.read().strip())
        return f.read().strip()
    
#Guarda Hash actual
def write_hash(hash_value):
    os.makedirs(os.path.dirname(HASH_FILE), exist_ok=True)
    with open(HASH_FILE, "w") as f:
        f.write(hash_value)

def log_warning(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    with open(LOG_FILE, "a") as log:
        log.write(f"[{timestamp}] WARNING: {message}\n")

# Parsear la columna de LOCALIZACION en formato "(long,lat)", ojo en el csv el orden que aparece es lat,long
def parse_coordinates(coord_str, capa_name):
    coord_str = str(coord_str).strip("() ")
    if "," not in coord_str:
        warning_msg = f"Coordenadas inválidas: '{coord_str}' en capa '{capa_name}'. Saltando fila."
        print(f"[WARN] {warning_msg}")
        log_warning(warning_msg)
        return None
    try:
        lat_str, lon_str = coord_str.split(",")
        lon = float(lon_str.strip())
        lat = float(lat_str.strip())
        return [lon, lat]
    except ValueError:
        warning_msg = f"Error al convertir coordenadas: '{coord_str}' en capa '{capa_name}'. Saltando fila."
        print(f"[WARN] {warning_msg}")
        log_warning(warning_msg)
        return None

def save_geojson(features, out_dir, file_name):
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    os.makedirs(out_dir, exist_ok=True)
    file_path = os.path.join(out_dir, file_name)
    with open(file_path, "w") as f:
        json.dump(geojson, f, indent=2)
    # Imprimir la ruta del archivo generado
    print(f"[OK] Archivo guardado en: {file_path}")

# === Proceso principal ===
def main():
    try:
        content = get_sheet_content()
        new_hash = compute_hash(content)
        last_hash = read_last_hash()

        if new_hash == last_hash:
            print("[INFO] No hay cambios en el archivo de Google Sheets.")
            return

        print("[INFO] Cambios detectados. Procesando...")
        df = pd.read_csv(StringIO(content.decode("utf-8")))

        # Preparamos las estructuras para las categoiras de datos 4g, 5g, and air pollution
        features_4g = {}
        features_5g = {}
        pollution_types = ["Concentración PM 2.5", "Concentración PM 10", "Concentración CO", "Concentración CO2"]
        features_pollution = {ptype: [] for ptype in pollution_types}

        for idx, row in df.iterrows():
            operador = str(row["OPERADOR"]).strip()
            coords = parse_coordinates(row["LOCALIZACION"], operador)
            if not coords:
                continue

            # 4G
            if pd.notnull(row.get("Intensidad 4G")) and str(row["Intensidad 4G"]).strip() != "":
                if operador not in features_4g:
                    features_4g[operador] = []
                feature = {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": coords},
                    "properties": {k: row[k] for k in df.columns if k not in ["LOCALIZACION", "OPERADOR", "Intensidad 5G", *pollution_types]}
                }
                feature["properties"]["Intensidad 4G"] = row["Intensidad 4G"]
                features_4g[operador].append(feature)

            # 5G
            if pd.notnull(row.get("Intensidad 5G")) and str(row["Intensidad 5G"]).strip() != "":
                if operador not in features_5g:
                    features_5g[operador] = []
                feature = {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": coords},
                    "properties": {k: row[k] for k in df.columns if k not in ["LOCALIZACION", "OPERADOR", "Intensidad 4G", *pollution_types]}
                }
                feature["properties"]["Intensidad 5G"] = row["Intensidad 5G"]
                features_5g[operador].append(feature)

            # Air pollution
            for ptype in pollution_types:
                if pd.notnull(row.get(ptype)) and str(row[ptype]).strip() != "":
                    feature = {
                        "type": "Feature",
                        "geometry": {"type": "Point", "coordinates": coords},
                        "properties": {k: row[k] for k in df.columns if k not in ["LOCALIZACION", "OPERADOR", "Intensidad 4G", "Intensidad 5G", *[pt for pt in pollution_types if pt != ptype]]}
                    }
                    feature["properties"][ptype] = row[ptype]
                    features_pollution[ptype].append(feature)

        # Guarda ficheros 4G 
        for operador, feats in features_4g.items():
            out_dir = os.path.join(OUTPUT_DIR, "4g")
            save_geojson(feats, out_dir, f"{operador}.geojson")

        # Guarda ficheros 5G
        for operador, feats in features_5g.items():
            out_dir = os.path.join(OUTPUT_DIR, "5g")
            save_geojson(feats, out_dir, f"{operador}.geojson")

        # Guarda ficheros contaminación del aire solo si hay features
        for ptype, feats in features_pollution.items():
            if feats:  # Solo guardar si hay al menos una feature
                out_dir = os.path.join(OUTPUT_DIR, "air_pollution")
                # Reemplazamos puntos y espacios en el filename
                fname = ptype.replace(" ", "_").replace(".", "") + ".geojson"
                save_geojson(feats, out_dir, fname)

        write_hash(new_hash)
        print("[OK] Hash actualizado y archivos guardados.")

    except Exception as e:
        print(f"[ERROR] {str(e)}")

if __name__ == "__main__":
    main()
