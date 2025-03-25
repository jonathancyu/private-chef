#!/usr/bin/env python3
"""
Simple script to capture an image from a Raspberry Pi camera
and save it to the current directory.
"""

import time
from picamera2 import Picamera2
import datetime


def capture_image(output_path=None):
    """
    Capture an image from the Raspberry Pi camera.

    Args:
        output_path (str, optional): Path where the image will be saved.
                                    If None, a timestamped filename will be used.

    Returns:
        str: Path where the image was saved
    """
    # Generate a filename with timestamp if not provided
    if output_path is None:
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = f"image_{timestamp}.jpg"

    # Initialize the camera
    picam2 = Picamera2()

    # Configure the camera
    config = picam2.create_still_configuration()
    picam2.configure(config)

    # Start the camera
    picam2.start()

    # Give the camera a moment to adjust
    time.sleep(2)

    # Capture the image
    picam2.capture_file(output_path)

    # Close the camera
    picam2.close()

    print(f"Image captured and saved to {output_path}")
    return output_path


if __name__ == "__main__":
    import argparse

    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description="Capture an image from Raspberry Pi camera"
    )
    parser.add_argument(
        "-o", "--output", help="Output file path (default: timestamped filename)"
    )
    args = parser.parse_args()

    # Capture the image
    capture_image(args.output)
