"""
Firebase Credentials to Environment Variables Converter
Converts firebase-credentials.json into Vercel-friendly environment variables
"""

import json
import os

def convert_firebase_creds_to_env():
    """Read firebase-credentials.json and output as environment variables"""
    
    cred_path = 'firebase-credentials.json'
    
    if not os.path.exists(cred_path):
        print(f"[ERROR] {cred_path} not found")
        print("Please download your Firebase service account credentials first:")
        print("1. Go to Firebase Console > Project Settings > Service Accounts")
        print("2. Click 'Generate new private key'")
        print("3. Save as 'firebase-credentials.json' in the backend folder")
        return
    
    try:
        with open(cred_path, 'r') as f:
            creds = json.load(f)
        
        print("\n" + "="*70)
        print("FIREBASE ENVIRONMENT VARIABLES FOR VERCEL")
        print("="*70)
        print("\nCopy these to your Vercel project's Environment Variables:\n")
        print("Go to: Vercel Dashboard > Your Project > Settings > Environment Variables\n")
        
        env_vars = {
            'FIREBASE_TYPE': creds.get('type', 'service_account'),
            'FIREBASE_PROJECT_ID': creds.get('project_id', ''),
            'FIREBASE_PRIVATE_KEY_ID': creds.get('private_key_id', ''),
            'FIREBASE_PRIVATE_KEY': creds.get('private_key', ''),
            'FIREBASE_CLIENT_EMAIL': creds.get('client_email', ''),
            'FIREBASE_CLIENT_ID': creds.get('client_id', ''),
            'FIREBASE_AUTH_URI': creds.get('auth_uri', 'https://accounts.google.com/o/oauth2/auth'),
            'FIREBASE_TOKEN_URI': creds.get('token_uri', 'https://oauth2.googleapis.com/token'),
            'FIREBASE_AUTH_PROVIDER_CERT_URL': creds.get('auth_provider_x509_cert_url', 'https://www.googleapis.com/oauth2/v1/certs'),
            'FIREBASE_CLIENT_CERT_URL': creds.get('client_x509_cert_url', '')
        }
        
        for key, value in env_vars.items():
            if key == 'FIREBASE_PRIVATE_KEY':
                # Show a snippet of the private key for security
                print(f"{key}=<your_private_key_here>")
                print(f"  > Full value is in the JSON file")
                print(f"  > Keep the \\n characters in the string")
                print(f"  > Include: -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----")
            else:
                print(f"{key}={value}")
        
        print("\n" + "="*70)
        print("IMPORTANT NOTES:")
        print("="*70)
        print("1. For FIREBASE_PRIVATE_KEY:")
        print("   - Copy the entire 'private_key' value from the JSON")
        print("   - Keep the \\n characters (don't convert to actual newlines)")
        print("   - Wrap in quotes if it contains special characters")
        print("   - It should look like: \"-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n\"")
        print("\n2. All variables should be added to Vercel:")
        print("   - Go to your Vercel project dashboard")
        print("   - Click Settings > Environment Variables")
        print("   - Add each variable listed above")
        print("   - Apply to: Production, Preview, and Development")
        print("\n3. After adding variables:")
        print("   - Redeploy your application")
        print("   - Check logs: vercel logs")
        print("="*70)
        
        # Also create a .env.vercel file for reference
        with open('.env.vercel', 'w', encoding='utf-8') as f:
            f.write("# Firebase Environment Variables for Vercel\n")
            f.write("# Copy these to Vercel Dashboard > Settings > Environment Variables\n\n")
            for key, value in env_vars.items():
                if key == 'FIREBASE_PRIVATE_KEY':
                    f.write(f"{key}=\"{value}\"\n")
                else:
                    f.write(f"{key}={value}\n")
        
        print(f"\n[OK] Also saved to .env.vercel for reference")
        print("\n[WARNING] DO NOT commit .env.vercel to git!")
        
    except json.JSONDecodeError:
        print("[ERROR] Invalid JSON in firebase-credentials.json")
    except Exception as e:
        print(f"[ERROR] {str(e)}")

if __name__ == "__main__":
    convert_firebase_creds_to_env()
