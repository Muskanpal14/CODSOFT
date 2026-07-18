"""
Contact Book CLI Application
----------------------------
A standalone Python terminal contact manager supporting:
- Storing Name, Phone Number, Email, and Physical Address for each contact
- Add, View, Search, Update, and Delete contacts
- JSON file persistence (`contacts.json`)
"""

import json
import os
import sys

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "contacts.json")

DEFAULT_CONTACTS = [
    {
        "name": "Alice Smith",
        "phone": "+1 555-0142",
        "email": "alice.smith@example.com",
        "address": "123 Market Street, San Francisco, CA",
        "category": "Work"
    },
    {
        "name": "David Johnson",
        "phone": "+1 555-0188",
        "email": "david.j@techsolutions.io",
        "address": "456 Tech Boulevard, Austin, TX",
        "category": "Work"
    },
    {
        "name": "Emily Davis",
        "phone": "+1 555-0199",
        "email": "emily.davis@family.net",
        "address": "789 Oak Lane, Seattle, WA",
        "category": "Family"
    }
]


def load_contacts():
    """Load contacts from contacts.json or seed default contacts if file missing."""
    if not os.path.exists(DATA_FILE):
        save_contacts(DEFAULT_CONTACTS)
        return DEFAULT_CONTACTS
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return []


def save_contacts(contacts):
    """Save contacts to contacts.json file."""
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(contacts, f, indent=4)


def clear_screen():
    """Clear terminal output."""
    os.system("cls" if os.name == "nt" else "clear")


def print_banner():
    print("=" * 60)
    print("                CONTACT BOOK APPLICATION                ")
    print("=" * 60)


def view_contacts(contacts, title="ALL SAVED CONTACTS"):
    """Display list of saved contacts with names and phone numbers."""
    print(f"\n--- {title} (Total: {len(contacts)}) ---")
    if not contacts:
        print("No contacts found.")
        return

    print(f"{'#':<4} | {'Name':<22} | {'Phone Number':<18} | {'Category':<10}")
    print("-" * 62)
    for idx, c in enumerate(contacts, 1):
        name = c.get('name', 'N/A')[:22]
        phone = c.get('phone', 'N/A')[:18]
        cat = c.get('category', 'General')[:10]
        print(f"{idx:<4} | {name:<22} | {phone:<18} | {cat:<10}")


def show_contact_details(contact):
    """Print complete contact details."""
    print("\n" + "-" * 40)
    print(f"Name     : {contact.get('name')}")
    print(f"Phone    : {contact.get('phone')}")
    print(f"Email    : {contact.get('email', 'N/A')}")
    print(f"Address  : {contact.get('address', 'N/A')}")
    print(f"Category : {contact.get('category', 'General')}")
    print("-" * 40)


def add_contact(contacts):
    """Add a new contact."""
    print("\n--- ADD NEW CONTACT ---")
    name = input("Enter Full Name*: ").strip()
    if not name:
        print("Error: Name cannot be empty.")
        return

    phone = input("Enter Phone Number*: ").strip()
    if not phone:
        print("Error: Phone number cannot be empty.")
        return

    email = input("Enter Email Address (optional): ").strip()
    address = input("Enter Physical Address (optional): ").strip()
    category = input("Enter Category (Personal/Work/Family/Other) [Personal]: ").strip() or "Personal"

    new_contact = {
        "name": name,
        "phone": phone,
        "email": email,
        "address": address,
        "category": category
    }

    contacts.append(new_contact)
    save_contacts(contacts)
    print(f"\n[SUCCESS] Contact '{name}' added successfully!")


def search_contacts(contacts):
    """Search contacts by name or phone number."""
    print("\n--- SEARCH CONTACTS ---")
    query = input("Enter Name or Phone Number to search: ").strip().lower()
    if not query:
        print("Search query was empty.")
        return

    results = []
    for c in contacts:
        if query in c.get('name', '').lower() or query in c.get('phone', '').lower():
            results.append(c)

    if not results:
        print(f"\nNo contacts matching '{query}'.")
        return

    view_contacts(results, f"SEARCH RESULTS FOR '{query}'")
    
    # Prompt to view full details
    choice = input("\nEnter contact number (#) to view full details (or press Enter to return): ").strip()
    if choice.isdigit():
        idx = int(choice) - 1
        if 0 <= idx < len(results):
            show_contact_details(results[idx])


def update_contact(contacts):
    """Update contact details."""
    view_contacts(contacts, "SELECT CONTACT TO UPDATE")
    if not contacts:
        return

    choice = input("\nEnter the number (#) of the contact to update (0 to cancel): ").strip()
    if not choice.isdigit() or int(choice) == 0:
        return

    idx = int(choice) - 1
    if not (0 <= idx < len(contacts)):
        print("Invalid selection.")
        return

    contact = contacts[idx]
    print(f"\nUpdating Contact: {contact['name']}")
    print("Press Enter to keep current value.")

    new_name = input(f"Full Name [{contact['name']}]: ").strip()
    new_phone = input(f"Phone Number [{contact['phone']}]: ").strip()
    new_email = input(f"Email [{contact.get('email', '')}]: ").strip()
    new_address = input(f"Address [{contact.get('address', '')}]: ").strip()
    new_category = input(f"Category [{contact.get('category', 'Personal')}]: ").strip()

    if new_name:
        contact['name'] = new_name
    if new_phone:
        contact['phone'] = new_phone
    if new_email:
        contact['email'] = new_email
    if new_address:
        contact['address'] = new_address
    if new_category:
        contact['category'] = new_category

    contacts[idx] = contact
    save_contacts(contacts)
    print(f"\n[SUCCESS] Contact '{contact['name']}' updated successfully!")


def delete_contact(contacts):
    """Delete a contact."""
    view_contacts(contacts, "SELECT CONTACT TO DELETE")
    if not contacts:
        return

    choice = input("\nEnter the number (#) of the contact to delete (0 to cancel): ").strip()
    if not choice.isdigit() or int(choice) == 0:
        return

    idx = int(choice) - 1
    if not (0 <= idx < len(contacts)):
        print("Invalid selection.")
        return

    contact = contacts[idx]
    confirm = input(f"Are you sure you want to delete '{contact['name']}'? (y/N): ").strip().lower()
    if confirm == 'y':
        removed = contacts.pop(idx)
        save_contacts(contacts)
        print(f"\n[SUCCESS] Contact '{removed['name']}' has been deleted.")
    else:
        print("Deletion cancelled.")


def main():
    contacts = load_contacts()

    while True:
        print_banner()
        print("1. View All Contacts")
        print("2. Add New Contact")
        print("3. Search Contact")
        print("4. Update Contact")
        print("5. Delete Contact")
        print("6. Exit")
        print("=" * 60)

        choice = input("Select an option (1-6): ").strip()

        if choice == '1':
            view_contacts(contacts)
            input("\nPress Enter to return to main menu...")
        elif choice == '2':
            add_contact(contacts)
            input("\nPress Enter to return to main menu...")
        elif choice == '3':
            search_contacts(contacts)
            input("\nPress Enter to return to main menu...")
        elif choice == '4':
            update_contact(contacts)
            input("\nPress Enter to return to main menu...")
        elif choice == '5':
            delete_contact(contacts)
            input("\nPress Enter to return to main menu...")
        elif choice == '6':
            print("\nThank you for using Contact Book!")
            sys.exit(0)
        else:
            print("\n[ERROR] Invalid option. Please choose a number between 1 and 6.")
            input("\nPress Enter to continue...")


if __name__ == "__main__":
    main()
