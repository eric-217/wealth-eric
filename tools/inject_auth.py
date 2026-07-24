import os

base = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "clients")
auth_tag = '<script>window.__AUTH_LOGIN_URL__="../../login.html";</script><script src="../../assets/auth.js"></script>'

count = 0
for client in ["chen", "template"]:
    d = os.path.join(base, client)
    if not os.path.isdir(d):
        continue
    for f in sorted(os.listdir(d)):
        if not f.endswith(".html"):
            continue
        fp = os.path.join(d, f)
        with open(fp, "r", encoding="utf-8") as fh:
            content = fh.read()

        if "__AUTH_LOGIN_URL__" in content:
            print(f"  SKIP (already): {client}/{f}")
            continue

        new_content = content.replace("</head>", auth_tag + "</head>", 1)
        if new_content == content:
            print(f"  WARN (no </head>): {client}/{f}")
            continue

        with open(fp, "w", encoding="utf-8") as fh:
            fh.write(new_content)
        print(f"  OK: {client}/{f}")
        count += 1

print(f"\nDone. {count} files injected.")
