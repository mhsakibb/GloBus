import urllib.request
import json
import os

def generate_graph(dot_code, output_file):
    url = 'https://quickchart.io/graphviz'
    data = json.dumps({'graph': dot_code}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
    })
    res = urllib.request.urlopen(req)
    with open(output_file, 'wb') as f:
        f.write(res.read())
    print(f"Saved {output_file}")

# Context Level DFD
context_dfd = """
digraph G {
    rankdir=LR;
    node [fontname="Arial", fontsize=12];
    edge [fontname="Arial", fontsize=10];
    
    Customer [shape=box, style=filled, fillcolor=lightblue];
    Admin [shape=box, style=filled, fillcolor=lightblue];
    SSLCommerz [shape=box, style=filled, fillcolor=lightblue, label="SSLCommerz\\nPayment Gateway"];
    
    System [shape=circle, style=filled, fillcolor=lightgreen, label="GloBus\\nE-commerce\\nSystem (0.0)"];
    
    Customer -> System [label=" Browse, Cart, Checkout Details"];
    System -> Customer [label=" Product Data, Order Status"];
    
    Admin -> System [label=" Product Updates, Settings"];
    System -> Admin [label=" Order Reports, Statistics"];
    
    System -> SSLCommerz [label=" Payment Request"];
    SSLCommerz -> System [label=" Transaction Status (IPN)"];
}
"""

# Level-0 DFD
level0_dfd = """
digraph G {
    rankdir=LR;
    node [fontname="Arial", fontsize=12];
    edge [fontname="Arial", fontsize=10];
    
    Customer [shape=box, style=filled, fillcolor=lightblue];
    Admin [shape=box, style=filled, fillcolor=lightblue];
    SSLCommerz [shape=box, style=filled, fillcolor=lightblue];
    
    P1 [shape=circle, style=filled, fillcolor=lightgreen, label="1.0\\nAuthentication\\n& Profile"];
    P2 [shape=circle, style=filled, fillcolor=lightgreen, label="2.0\\nProduct\\nManagement"];
    P3 [shape=circle, style=filled, fillcolor=lightgreen, label="3.0\\nOrder &\\nCheckout"];
    
    D1 [shape=cylinder, label="Users DB"];
    D2 [shape=cylinder, label="Products DB"];
    D3 [shape=cylinder, label="Orders DB"];
    
    Customer -> P1 [label=" Credentials"];
    P1 -> D1 [label=" Validate/Store"];
    D1 -> P1 [label=" User Info"];
    P1 -> Customer [label=" Token/Profile"];
    
    Admin -> P2 [label=" Product Details"];
    P2 -> D2 [label=" Store Item"];
    D2 -> P2 [label=" Item Data"];
    P2 -> Customer [label=" View Catalog"];
    
    Customer -> P3 [label=" Checkout Form"];
    P3 -> D3 [label=" Create Order"];
    D3 -> P3 [label=" Order Info"];
    P3 -> SSLCommerz [label=" Initiate Payment"];
    SSLCommerz -> P3 [label=" Payment Status"];
    P3 -> Customer [label=" Invoice"];
    
    Admin -> P3 [label=" Fulfill Order"];
}
"""

output_dir = r'd:\Project\GloBus\Globus Latex\images'
os.makedirs(output_dir, exist_ok=True)

generate_graph(context_dfd, os.path.join(output_dir, 'dfd_context.png'))
generate_graph(level0_dfd, os.path.join(output_dir, 'dfd_level0.png'))
