import random


def generate_random_code() -> str:
    """Generate a random order code in format PED-XXXX"""
    random_number = random.randint(0, 9999)
    return f"PED-{random_number:04d}"
