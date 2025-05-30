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
        
def save_geojson(df, capa_name):
    features = []
    for _, row in df.iterrows():
        # Parsear la columna de LOCALIZACION en formato "(long,lat)", ojo en el csv el orden que aparece es lat,long
        coord_str = str(row["LOCALIZACION"]).strip("() ") #cast a string porque pandas interpretaba como float
        if "," not in coord_str:
            warning_msg = f"Coordenadas inválidas: '{coord_str}' en capa '{capa_name}'. Saltando fila."
            print(f"[WARN] {warning_msg}")
            log_warning(warning_msg)
            continue

        try:
            lat_str,lon_str = coord_str.split(",")
            lon = float(lon_str.strip())
            lat = float(lat_str.strip())
        except ValueError:
            warning_msg = f"Error al convertir coordenadas: '{coord_str}' en capa '{capa_name}'. Saltando fila."
            print(f"[WARN] {warning_msg}")
            log_warning(warning_msg)
            continue

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat],
            },
            "properties": {
                key: row[key] for key in df.columns
                if key not in ["LOCALIZACION", "OPERADOR"]
            }
        }
        features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    file_path = os.path.join(OUTPUT_DIR, f"{capa_name}.geojson")

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

        # Separamos datos por columna OPERADOR
        for capa in df["OPERADOR"].unique():
            df_capa = df[df["OPERADOR"] == capa]
            save_geojson(df_capa, capa)
            print(f"[OK] Generado {capa}.geojson")

        write_hash(new_hash)
        print("[OK] Hash actualizado y archivos guardados.")

    except Exception as e:
        print(f"[ERROR] {str(e)}")

if __name__ == "__main__":
    main()
