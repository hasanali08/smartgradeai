import os
import sys

# Ensure backend directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database

print("Dropping all tables...")
database.Base.metadata.drop_all(bind=database.engine)

print("Recreating all tables...")
database.Base.metadata.create_all(bind=database.engine)

print("Database reset successfully.")
