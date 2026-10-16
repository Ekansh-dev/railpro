import secrets
import string
import re

def generate_secure_password(length: int = 10) -> str:
    """
    Generate a random, readable temporary password containing:
    uppercase, lowercase, digits, and safe special characters.
    """
    if length < 8:
        length = 8
        
    chars = string.ascii_letters + string.digits + "@#%&"
    # Ensure at least 1 upper, 1 lower, 1 digit, 1 special
    pwd = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice("@#%&"),
    ]
    for _ in range(length - 4):
        pwd.append(secrets.choice(chars))
        
    secrets.SystemRandom().shuffle(pwd)
    return "".join(pwd)

def slugify(text: str) -> str:
    """Create a URL/filter-friendly slug from a text string."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")
