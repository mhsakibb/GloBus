import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(20, 12))
ax.set_xlim(0, 21)
ax.set_ylim(0, 12)
ax.axis('off')

color_entity = '#add8e6'
color_process = '#90ee90'
color_db = '#ffdead'

def draw_db(x, y, w, h, text):
    rect = patches.Rectangle((x, y), w, h, facecolor=color_db, edgecolor='black', linewidth=2)
    ax.add_patch(rect)
    ax.plot([x+0.3, x+0.3], [y, y+h], color='black', linewidth=2)
    ax.text(x + w/2 + 0.15, y + h/2, text, ha='center', va='center', fontsize=12, fontweight='bold')

def draw_arrow(start, end, text, rad=0.0, text_offset_x=0, text_offset_y=0, fontsize=10):
    arrow = patches.FancyArrowPatch(
        start, end, connectionstyle=f"arc3,rad={rad}", 
        color='black', arrowstyle="->", mutation_scale=15, linewidth=1.5
    )
    ax.add_patch(arrow)
    mid_x = (start[0] + end[0]) / 2 + text_offset_x
    mid_y = (start[1] + end[1]) / 2 + text_offset_y
    ax.text(mid_x, mid_y, text, ha='center', va='center', fontsize=fontsize, 
            bbox=dict(facecolor='white', edgecolor='gray', boxstyle='round,pad=0.3', alpha=0.95))

# Entities
# Customer (Center 10.5, 10.5)
rect_cust = patches.Rectangle((9.5, 10), 2, 1, facecolor=color_entity, edgecolor='black', linewidth=2)
ax.add_patch(rect_cust)
ax.text(10.5, 10.5, "Customer", ha='center', va='center', fontsize=14, fontweight='bold')

# Admin (Center 13, 4.5)
rect_admin = patches.Rectangle((12, 4), 2, 1, facecolor=color_entity, edgecolor='black', linewidth=2)
ax.add_patch(rect_admin)
ax.text(13, 4.5, "Admin", ha='center', va='center', fontsize=14, fontweight='bold')

# SSLCommerz (Center 19.5, 7)
rect_ssl = patches.Rectangle((18.5, 6.5), 2, 1, facecolor=color_entity, edgecolor='black', linewidth=2)
ax.add_patch(rect_ssl)
ax.text(19.5, 7, "SSLCommerz", ha='center', va='center', fontsize=14, fontweight='bold')

# Processes (Radius 1.3)
c1 = patches.Circle((4, 7), 1.3, facecolor=color_process, edgecolor='black', linewidth=2)
ax.add_patch(c1)
ax.text(4, 7, "1.0\nAuthentication\n& Profile", ha='center', va='center', fontsize=12, fontweight='bold')

c2 = patches.Circle((10.5, 7), 1.3, facecolor=color_process, edgecolor='black', linewidth=2)
ax.add_patch(c2)
ax.text(10.5, 7, "2.0\nProduct\nManagement", ha='center', va='center', fontsize=12, fontweight='bold')

c3 = patches.Circle((16, 7), 1.3, facecolor=color_process, edgecolor='black', linewidth=2)
ax.add_patch(c3)
ax.text(16, 7, "3.0\nOrder &\nCheckout", ha='center', va='center', fontsize=12, fontweight='bold')

# Databases (Center X: 4, 10.5, 16. Y: 2)
draw_db(3, 1.5, 2, 1, "Users DB")
draw_db(9.5, 1.5, 2, 1, "Products DB")
draw_db(15, 1.5, 2, 1, "Orders DB")

# Arrows: Customer (10.5, 10.5) <-> Auth (4, 7)
draw_arrow((9.5, 10.2), (4.8, 8), "Login Credentials", rad=0.1, text_offset_x=-0.5, text_offset_y=0.4)
draw_arrow((4.5, 8.2), (9.5, 10.7), "JWT Token / Profile", rad=0.1, text_offset_x=0.5, text_offset_y=0.2)

# Arrows: Customer (10.5, 10.5) <-> Products (10.5, 7)
draw_arrow((10.3, 10), (10.3, 8.3), "Search / Browse", rad=0)
draw_arrow((10.7, 8.3), (10.7, 10), "Product Catalog", rad=0)

# Arrows: Customer (10.5, 10.5) <-> Checkout (16, 7)
draw_arrow((11.5, 10.2), (15.2, 8), "Place Order", rad=-0.1, text_offset_x=0.5, text_offset_y=0.4)
draw_arrow((15.5, 8.2), (11.5, 10.7), "Order Invoice", rad=-0.1, text_offset_x=-0.5, text_offset_y=0.2)

# Arrows: Admin (13, 4.5) <-> Products (10.5, 7)
draw_arrow((12.5, 5), (11.5, 6.2), "Add/Edit Items", rad=0.1, text_offset_x=-0.6)

# Arrows: Admin (13, 4.5) <-> Checkout (16, 7)
draw_arrow((13.5, 5), (15.2, 6), "Update Fulfillment", rad=-0.1, text_offset_x=0.6, text_offset_y=-0.2)

# Arrows: Auth (4, 7) <-> Users DB (4, 2)
draw_arrow((3.8, 5.7), (3.8, 2.5), "Store Profile", rad=0)
draw_arrow((4.2, 2.5), (4.2, 5.7), "Auth Data", rad=0)

# Arrows: Products (10.5, 7) <-> Products DB (10.5, 2)
draw_arrow((10.3, 5.7), (10.3, 2.5), "Query Catalog", rad=0)
draw_arrow((10.7, 2.5), (10.7, 5.7), "Item Details", rad=0)

# Arrows: Checkout (16, 7) <-> Orders DB (16, 2)
draw_arrow((15.8, 5.7), (15.8, 2.5), "Save Order", rad=0)
draw_arrow((16.2, 2.5), (16.2, 5.7), "Order ID", rad=0)

# Arrows: Checkout (16, 7) <-> SSLCommerz (19.5, 7)
draw_arrow((17.3, 7.2), (18.5, 7.2), "Initiate Payment", rad=0, text_offset_y=0.3)
draw_arrow((18.5, 6.8), (17.3, 6.8), "Payment IPN Status", rad=0, text_offset_y=-0.3)

plt.title("Level-0 DFD of GloBus E-commerce Platform", fontsize=22, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig(r'd:\Project\GloBus\Globus Latex\images\dfd_level0.png', dpi=300, bbox_inches='tight')
print("Successfully generated non-overlapping dfd_level0.png")
