import urllib.request
try:
    import pymysql
    print("pymysql installed")
except ImportError:
    print("need pip install pymysql")
