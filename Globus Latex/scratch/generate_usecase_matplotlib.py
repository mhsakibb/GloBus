import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(16, 11))
ax.set_xlim(0, 16)
ax.set_ylim(0, 11)
ax.axis('off')

# Colors
color_uc = '#FFFACD' # LemonChiffon
line_color = '#333333'

def draw_stick_figure(x, y, name):
    # Head
    head = patches.Circle((x, y + 1.2), 0.2, facecolor='white', edgecolor=line_color, linewidth=2, zorder=3)
    ax.add_patch(head)
    # Body
    ax.plot([x, x], [y + 0.4, y + 1.0], color=line_color, linewidth=2)
    # Arms
    ax.plot([x - 0.4, x + 0.4], [y + 0.8, y + 0.8], color=line_color, linewidth=2)
    # Legs
    ax.plot([x, x - 0.3], [y + 0.4, y], color=line_color, linewidth=2)
    ax.plot([x, x + 0.3], [y + 0.4, y], color=line_color, linewidth=2)
    # Name
    ax.text(x, y - 0.3, name, ha='center', va='top', fontsize=14, fontweight='bold')

def draw_use_case(x, y, text):
    # Oval: width 4, height 1 -> rx=2, ry=0.5
    oval = patches.Ellipse((x, y), 4, 1, facecolor=color_uc, edgecolor=line_color, linewidth=1.5)
    ax.add_patch(oval)
    ax.text(x, y, text, ha='center', va='center', fontsize=11, fontweight='bold')

def draw_line(x1, y1, x2, y2):
    ax.plot([x1, x2], [y1, y2], color=line_color, linewidth=1.5, zorder=1)

# Draw System Boundary
# X=4 to 12, Y=0.2 to 10.2
boundary = patches.Rectangle((4, 0.2), 8, 10, facecolor='#F0F8FF', edgecolor=line_color, linewidth=2, linestyle='--')
ax.add_patch(boundary)
ax.text(8, 9.8, "GloBus E-commerce System", ha='center', va='center', fontsize=14, fontweight='bold')

# Draw Actors (Customer on left, Admin on right)
draw_stick_figure(2, 5.5, "Customer")
draw_stick_figure(14, 5.5, "Admin")

# Draw Use Cases
y_coords = [9.0, 7.8, 6.6, 5.4, 4.2, 3.0, 1.8, 0.6]
texts = [
    "Register / Login",
    "Browse Catalog",
    "Search (AI & Text)",
    "Manage Cart",
    "Checkout & Pay",
    "View Order History",
    "Manage Products",
    "Manage Orders"
]

for y, text in zip(y_coords, texts):
    draw_use_case(8, y, text)

# Connect Customer (Center X=2.4, Y=6.3) to Top 6
cust_x, cust_y = 2.4, 6.3
draw_line(cust_x, cust_y, 6, 9.0)
draw_line(cust_x, cust_y, 6, 7.8)
draw_line(cust_x, cust_y, 6, 6.6)
draw_line(cust_x, cust_y, 6, 5.4)
draw_line(cust_x, cust_y, 6, 4.2)
draw_line(cust_x, cust_y, 6, 3.0)

# Connect Admin (Center X=13.6, Y=6.3) to Login, Mng Products, Mng Orders
admin_x, admin_y = 13.6, 6.3
draw_line(admin_x, admin_y, 10, 9.0)
draw_line(admin_x, admin_y, 10, 1.8)
draw_line(admin_x, admin_y, 10, 0.6)

plt.title("Use Case Diagram for Customer and Admin", fontsize=24, fontweight='bold', pad=10)
plt.tight_layout()
plt.savefig(r'd:\Project\GloBus\Globus Latex\images\use_case.png', dpi=300, bbox_inches='tight')
print("Successfully generated use_case.png (Customer and Admin only)")
