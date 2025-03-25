#!/usr/bin/env python3
"""
Fridge Item Classifier using Ultralytics YOLO11

This script analyzes a photo of a fridge shelf and identifies the items present
using the YOLO11 object detection model.
"""

import argparse
import os
from pathlib import Path
from typing import List, Dict, Any

import cv2
from ultralytics import YOLO


def parse_arguments() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Classify items in a fridge photo using YOLO11"
    )
    parser.add_argument("image_path", type=str, help="Path to the input JPG image")
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=Path("output.jpg"),
        help="Path to save the annotated output image (default: output.jpg)",
    )
    parser.add_argument(
        "--conf",
        type=float,
        default=0.25,
        help="Confidence threshold for detections (default: 0.25)",
    )
    parser.add_argument(
        "--model",
        type=str,
        default="yolov11n.pt",
        help="YOLO model to use (default: yolov11n)",
    )
    return parser.parse_args()


def detect_items(
    model: YOLO, image_path: str, conf_threshold: float
) -> List[Dict[str, Any]]:
    """
    Detect items in the image using the YOLO model.

    Args:
        model: The YOLO model
        image_path: Path to the input image
        conf_threshold: Confidence threshold for detections

    Returns:
        List of detected items with their details
    """
    # Ensure the image exists
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    # Run inference
    results = model(image_path, conf=conf_threshold)[0]

    # Process results
    detections = []
    for i, (box, conf, cls) in enumerate(
        zip(
            results.boxes.xyxy.cpu().numpy(),
            results.boxes.conf.cpu().numpy(),
            results.boxes.cls.cpu().numpy(),
        )
    ):
        class_id = int(cls)
        class_name = results.names[class_id]
        confidence = float(conf)
        x1, y1, x2, y2 = box.astype(int)

        detections.append(
            {
                "id": i,
                "class_id": class_id,
                "class_name": class_name,
                "confidence": confidence,
                "box": [x1, y1, x2, y2],
            }
        )

    return detections


def visualize_results(
    image_path: str, detections: List[Dict[str, Any]], output_path: str
) -> None:
    """
    Draw bounding boxes and labels on the image and save it.

    Args:
        image_path: Path to the input image
        detections: List of detected items
        output_path: Path to save the annotated image
    """
    # Read the image
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Failed to read image: {image_path}")

    # Draw bounding boxes and labels
    for detection in detections:
        x1, y1, x2, y2 = detection["box"]
        class_name = detection["class_name"]
        confidence = detection["confidence"]

        # Draw bounding box
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)

        # Prepare label text
        label = f"{class_name}: {confidence:.2f}"

        # Get text size
        (text_width, text_height), _ = cv2.getTextSize(
            label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2
        )

        # Draw label background
        cv2.rectangle(
            image,
            (x1, y1 - text_height - 10),
            (x1 + text_width + 10, y1),
            (0, 255, 0),
            -1,
        )

        # Draw label text
        cv2.putText(
            image, label, (x1 + 5, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2
        )

    # Save the annotated image
    cv2.imwrite(output_path, image)
    print(f"Annotated image saved to: {output_path}")


def summarize_results(detections: List[Dict[str, Any]]) -> None:
    """
    Print a summary of detected items.

    Args:
        detections: List of detected items
    """
    if not detections:
        print("No items detected in the image.")
        return

    print("\n===== Detected Items =====")

    # Count occurrences of each class
    item_counts = {}
    for detection in detections:
        class_name = detection["class_name"]
        if class_name in item_counts:
            item_counts[class_name] += 1
        else:
            item_counts[class_name] = 1

    # Print summary
    for class_name, count in item_counts.items():
        print(f"- {class_name}: {count}")

    print(f"\nTotal items detected: {len(detections)}")


def main() -> None:
    """Main function to run the fridge item classifier."""
    # Parse arguments
    args = parse_arguments()

    print(f"Analyzing image: {args.image_path}")

    try:
        # Load model
        print(f"Loading YOLO model: {args.model}")
        model = YOLO(args.model)

        # Detect items
        print("Detecting items...")
        detections = detect_items(model, args.image_path, args.conf)

        # Visualize results
        print("Visualizing results...")
        visualize_results(args.image_path, detections, args.output)

        # Summarize results
        summarize_results(detections)

        print("\nAnalysis complete!")

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
