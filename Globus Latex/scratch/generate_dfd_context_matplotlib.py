import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(10, 6))
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.axis('off')

# Colors
color_entity = '#add8e6'
color_process = '#90ee90'

# Draw System (Center)
circle = patches.Circle((5, 3), 1, facecolor=color_process, edgecolor='black', linewidth=2)
ax.add_patch(circle)
ax.text(5, 3, "GloBus\nE-commerce\nSystem (0.0)", ha='center', va='center', fontsize=12, fontweight='bold')

# Draw Customer (Left)
rect_cust = patches.Rectangle((0.5, 2.5), 2, 1, facecolor=color_entity, edgecolor='black', linewidth=2)
ax.add_patch(rect_cust)
ax.text(1.5, 3, "Customer", ha='center', va='center', fontsize=12, fontweight='bold')

# Draw Admin (Right Top)
rect_admin = patches.Rectangle((7.5, 4.2), 2, 1, facecolor=color_entity, edgecolor='black', linewidth=2)
ax.add_patch(rect_admin)
ax.text(8.5, 4.7, "Admin", ha='center', va='center', fontsize=12, fontweight='bold')

# Draw SSLCommerz (Right Bottom)
rect_ssl = patches.Rectangle((7.5, 0.8), 2, 1, facecolor=color_entity, edgecolor='black', linewidth=2)
ax.add_patch(rect_ssl)
ax.text(8.5, 1.3, "SSLCommerz\nPayment Gateway", ha='center', va='center', fontsize=12, fontweight='bold')

# Helper to draw arrows with text
def draw_arrow(start, end, text, rad=0.2, text_offset_x=0, text_offset_y=0):
    arrow = patches.FancyArrowPatch(
        start, end, connectionstyle=f"arc3,rad={rad}", 
        color='black', arrowstyle="->", mutation_scale=15, linewidth=1.5
    )
    ax.add_patch(arrow)
    mid_x = (start[0] + end[0]) / 2 + text_offset_x
    mid_y = (start[1] + end[1]) / 2 + text_offset_y
    ax.text(mid_x, mid_y, text, ha='center', va='center', fontsize=10, bbox=dict(facecolor='white', edgecolor='none', alpha=0.9, pad=1))

# Customer <-> System
# Left edge of circle is 4.0, right edge of Customer is 2.5
draw_arrow((2.5, 3.2), (4.0, 3.2), "Browse, Cart, Checkout", rad=0.2, text_offset_y=0.25)
draw_arrow((4.0, 2.8), (2.5, 2.8), "Product Data, Order Status", rad=0.2, text_offset_y=-0.25)

# Admin <-> System
# Top right of circle is approx (5.7, 3.7), left edge of Admin is 7.5
draw_arrow((7.5, 4.5), (5.7, 3.7), "Product Updates", rad=0.1, text_offset_x=-0.2, text_offset_y=0.1)
draw_arrow((5.7, 3.4), (7.5, 4.2), "Order Reports", rad=0.1, text_offset_x=0.2, text_offset_y=-0.2)

# System <-> SSLCommerz
# Bottom right of circle is approx (5.7, 2.3), left edge of SSL is 7.5
draw_arrow((5.7, 2.6), (7.5, 1.6), "Payment Request", rad=0.1, text_offset_x=0.2, text_offset_y=0.2)
draw_arrow((7.5, 1.3), (5.7, 2.3), "Transaction Status (IPN)", rad=0.1, text_offset_x=-0.2, text_offset_y=-0.2)

plt.title("Context Level DFD of GloBus", fontsize=16, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig(r'd:\Project\GloBus\Globus Latex\images\dfd_context.png', dpi=300, bbox_inches='tight')
print("Successfully generated dfd_context.png")
