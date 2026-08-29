import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(16, 19))
ax.set_xlim(0, 16)
ax.set_ylim(0, 19)
ax.axis('off')

# Colors
color_action = '#E6E6FA' # Lavender
color_decision = '#FFDAB9' # PeachPuff
line_color = '#333333'

def draw_start(x, y):
    ax.add_patch(patches.Circle((x, y), 0.3, facecolor='black', zorder=3))

def draw_end(x, y):
    ax.add_patch(patches.Circle((x, y), 0.4, facecolor='white', edgecolor='black', linewidth=2, zorder=3))
    ax.add_patch(patches.Circle((x, y), 0.25, facecolor='black', zorder=3))

def draw_action(x, y, text, w=4.2, h=0.9):
    rect = patches.FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle="round,pad=0.1,rounding_size=0.2", 
                                  facecolor=color_action, edgecolor=line_color, linewidth=2, zorder=3)
    ax.add_patch(rect)
    ax.text(x, y, text, ha='center', va='center', fontsize=13, fontweight='bold', zorder=4)

def draw_decision(x, y, text, w=2.8, h=1.4):
    pts = [[x, y + h/2], [x + w/2, y], [x, y - h/2], [x - w/2, y]]
    poly = patches.Polygon(pts, facecolor=color_decision, edgecolor=line_color, linewidth=2, zorder=3)
    ax.add_patch(poly)
    ax.text(x, y, text, ha='center', va='center', fontsize=12, fontweight='bold', zorder=4)

def draw_routing_line(points, label=None, label_pos=None):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    ax.plot(xs, ys, color=line_color, linewidth=2, zorder=1)
    
    # Arrow head
    dx = xs[-1] - xs[-2]
    dy = ys[-1] - ys[-2]
    length = (dx**2 + dy**2)**0.5
    if length > 0:
        dx = dx/length * 0.3
        dy = dy/length * 0.3
        ax.arrow(xs[-2], ys[-2], xs[-1]-xs[-2]-dx, ys[-1]-ys[-2]-dy, 
                 head_width=0.25, head_length=0.35, fc=line_color, ec=line_color, length_includes_head=True, zorder=2)
    
    if label and label_pos:
        ax.text(label_pos[0], label_pos[1], label, ha='center', va='center', fontsize=12, fontweight='bold',
                bbox=dict(facecolor='white', edgecolor='none', pad=2, alpha=0.9), zorder=4)

# Y Coordinates
y_start = 18.0
y_cart = 16.7
y_checkout = 15.4
y_login = 13.9
y_ship = 12.4
y_pay = 11.1
y_type = 9.6
y_ssl = 8.1
y_success = 6.6
y_confirm = 4.9
y_db = 3.6
y_invoice = 2.3
y_end = 1.0

# Draw Nodes
draw_start(8, y_start)
draw_action(8, y_cart, "View Cart")
draw_action(8, y_checkout, "Click Checkout")

draw_decision(8, y_login, "Logged In?")
draw_action(2.5, y_login, "Login / Register", w=3.4)

draw_action(8, y_ship, "Enter Shipping Details")
draw_action(8, y_pay, "Select Payment Method")

draw_decision(8, y_type, "Payment Type")
draw_action(8, y_ssl, "Redirect to SSLCommerz")
draw_decision(8, y_success, "Success?")
draw_action(2.5, y_success, "Payment Failed", w=3.4)

draw_action(8, y_confirm, "Confirm Order")
draw_action(8, y_db, "Save Order to DB")
draw_action(8, y_invoice, "Send Invoice Email")
draw_end(8, y_end)

# Draw Connections
draw_routing_line([(8, y_start - 0.3), (8, y_cart + 0.45)])
draw_routing_line([(8, y_cart - 0.45), (8, y_checkout + 0.45)])
draw_routing_line([(8, y_checkout - 0.45), (8, y_login + 0.7)])

# Logged In
draw_routing_line([(8, y_login - 0.7), (8, y_ship + 0.45)], "[Yes]", (8.6, y_login - 0.9))
draw_routing_line([(6.6, y_login), (4.2, y_login)], "[No]", (5.4, y_login + 0.25))

# Login -> Shipping (Merges into Yes branch)
draw_routing_line([(2.5, y_login - 0.45), (2.5, y_ship + 0.6), (8, y_ship + 0.6), (8, y_ship + 0.45)])

# Ship -> Pay -> Type
draw_routing_line([(8, y_ship - 0.45), (8, y_pay + 0.45)])
draw_routing_line([(8, y_pay - 0.45), (8, y_type + 0.7)])

# Type -> SSL
draw_routing_line([(8, y_type - 0.7), (8, y_ssl + 0.45)], "[Online]", (8.7, y_type - 0.9))
# SSL -> Success
draw_routing_line([(8, y_ssl - 0.45), (8, y_success + 0.7)])

# Success -> Confirm
draw_routing_line([(8, y_success - 0.7), (8, y_confirm + 0.45)], "[Yes]", (8.6, y_success - 0.9))
# Success -> Failed
draw_routing_line([(6.6, y_success), (4.2, y_success)], "[No]", (5.4, y_success + 0.25))

# Failed -> Back to Payment Method
draw_routing_line([(2.5, y_success + 0.45), (2.5, y_pay), (5.9, y_pay)])

# Type COD -> Confirm
# Branch goes Right, Down, Left
draw_routing_line([(9.4, y_type), (13.5, y_type), (13.5, y_confirm), (10.1, y_confirm)], "[COD]", (11.45, y_type + 0.25))

# Confirm -> DB -> Invoice -> End
draw_routing_line([(8, y_confirm - 0.45), (8, y_db + 0.45)])
draw_routing_line([(8, y_db - 0.45), (8, y_invoice + 0.45)])
draw_routing_line([(8, y_invoice - 0.45), (8, y_end + 0.4)])

plt.title("Activity Diagram of Checkout Process", fontsize=24, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig(r'd:\Project\GloBus\Globus Latex\images\activity_diagram.png', dpi=300, bbox_inches='tight')
print("Successfully generated Activity Diagram")
