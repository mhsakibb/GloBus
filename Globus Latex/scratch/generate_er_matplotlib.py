import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(18, 12))
ax.set_xlim(-1, 18)
ax.set_ylim(-1, 11)
ax.axis('off')

# Colors
header_color = '#4A90E2'
body_color = '#F5F7FA'
line_color = '#333333'

def draw_table(x, y, w, h, title, fields):
    # Body
    ax.add_patch(patches.Rectangle((x, y), w, h, facecolor=body_color, edgecolor=line_color, linewidth=2))
    # Header
    header_h = 0.6
    ax.add_patch(patches.Rectangle((x, y + h - header_h), w, header_h, facecolor=header_color, edgecolor=line_color, linewidth=2))
    ax.text(x + w/2, y + h - header_h/2, title, ha='center', va='center', fontsize=14, fontweight='bold', color='white')
    
    # Fields
    for i, field in enumerate(fields):
        if "(PK)" in field:
            fontweight = 'bold'
        else:
            fontweight = 'normal'
            
        ax.text(x + 0.2, y + h - header_h - 0.4 - (i * 0.45), field, ha='left', va='center', fontsize=12, fontweight=fontweight)

def draw_routing_line(points, label=None, label_pos=None):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    ax.plot(xs, ys, color=line_color, linewidth=2)
    
    # Draw arrow head at the final point based on direction
    dx = xs[-1] - xs[-2]
    dy = ys[-1] - ys[-2]
    # Normalize
    length = (dx**2 + dy**2)**0.5
    if length > 0:
        dx = dx/length * 0.3
        dy = dy/length * 0.3
        ax.arrow(xs[-2], ys[-2], xs[-1]-xs[-2]-dx, ys[-1]-ys[-2]-dy, 
                 head_width=0.2, head_length=0.3, fc=line_color, ec=line_color, 
                 length_includes_head=True)
    
    if label and label_pos:
        ax.text(label_pos[0], label_pos[1], label, ha='center', va='center', fontsize=11, fontweight='bold',
                bbox=dict(facecolor='white', edgecolor='gray', boxstyle='round,pad=0.3', alpha=0.95))

# Draw Tables
w, h = 3.5, 3.5

# Top Row
draw_table(1, 6, w, h, "User", ["_id (PK)", "name", "email", "password", "role", "createdAt"])
draw_table(7, 6, w, h, "Order", ["_id (PK)", "user_id (FK)", "totalAmount", "paymentStatus", "deliveryStatus", "products (Array)"])
draw_table(13, 6, w, h, "Cart", ["_id (PK)", "user_id (FK)", "products (Array)", "totalPrice", "updatedAt"])

# Bottom Row
draw_table(1, 1, w, h, "Category", ["_id (PK)", "name", "description", "imageUrl"])
draw_table(7, 1, w, h, "Product", ["_id (PK)", "category_id (FK)", "name", "price", "stock", "ratings"])
draw_table(13, 1, w, h, "Review", ["_id (PK)", "user_id (FK)", "product_id (FK)", "rating", "comment"])

# Draw Relationships

# 1. User to Order: Horizontal, right from User to left of Order
draw_routing_line([(4.5, 7.5), (7, 7.5)], "Places (1:N)", (5.75, 7.7))

# 2. Category to Product: Horizontal
draw_routing_line([(4.5, 2.5), (7, 2.5)], "Contains (1:N)", (5.75, 2.7))

# 3. Product to Review: Horizontal
draw_routing_line([(10.5, 2.5), (13, 2.5)], "Receives (1:N)", (11.75, 2.7))

# 4. Product to Order: Vertical
draw_routing_line([(8.75, 4.5), (8.75, 6)], "Includes (M:N)", (8.75, 5.25))

# 5. Product to Cart: Vertical/L-Shape
# From Product Top-Right (10.0, 4.5) to Cart Bottom-Left (14.0, 6)
draw_routing_line([(10.0, 4.5), (10.0, 5.25), (14.75, 5.25), (14.75, 6)], "Added To (M:N)", (12.375, 5.45))

# 6. User to Cart: Over the top
# From User Top (2.75, 9.5) to Cart Top (14.75, 9.5)
draw_routing_line([(2.75, 9.5), (2.75, 10.2), (14.75, 10.2), (14.75, 9.5)], "Owns (1:1)", (8.75, 10.4))

# 7. User to Review: Underneath and around
# From User Left (1, 7.5) -> (-0.2, 7.5) -> (-0.2, 0) -> (14.75, 0) -> (14.75, 1)
draw_routing_line([(1, 7.5), (-0.2, 7.5), (-0.2, 0), (14.75, 0), (14.75, 1)], "Writes (1:N)", (7, 0.2))

plt.title("Entity Relationship (ER) Diagram of GloBus Database", fontsize=24, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig(r'd:\Project\GloBus\Globus Latex\images\er_diagram.png', dpi=300, bbox_inches='tight')
print("Successfully generated ER Diagram.")
