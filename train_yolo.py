from ultralytics import YOLO

model = YOLO("models/yolo11x-obb.pt")

results = model.train("./dataset_specs/SKU-110K.yaml", epochs=10, imgsz=640)
