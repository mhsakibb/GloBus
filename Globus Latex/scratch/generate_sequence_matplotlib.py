import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(16, 14))
ax.set_xlim(0, 16)
ax.set_ylim(0, 14)
ax.axis('off')

# Colors
header_color = '#4A90E2'
line_color = '#333333'
activation_color = '#B0C4DE'

def draw_lifeline(x, name):
    # Header box
    rect = patches.Rectangle((x - 1.5, 12.8), 3, 0.8, facecolor=header_color, edgecolor=line_color, linewidth=2, zorder=3)
    ax.add_patch(rect)
    ax.text(x, 13.2, name, ha='center', va='center', fontsize=13, fontweight='bold', color='white', zorder=4)
    # Dashed line
    ax.plot([x, x], [12.8, 1.0], linestyle='--', color='gray', linewidth=1.5, zorder=1)

def draw_activation(x, y_start, y_end):
    rect = patches.Rectangle((x - 0.15, y_end), 0.3, y_start - y_end, facecolor=activation_color, edgecolor=line_color, linewidth=1.5, zorder=2)
    ax.add_patch(rect)

def draw_message(x1, x2, y, text, is_return=False):
    style = "--" if is_return else "-"
    
    # Calculate text position (slightly above line)
    mid_x = (x1 + x2) / 2
    ax.text(mid_x, y + 0.15, text, ha='center', va='bottom', fontsize=12, fontweight='bold',
            bbox=dict(facecolor='white', edgecolor='none', pad=2, alpha=0.9), zorder=4)
    
    # Draw arrow
    arrow = patches.FancyArrowPatch(
        (x1, y), (x2, y), 
        arrowstyle="-|>" if not is_return else "->", 
        linestyle=style, color=line_color, mutation_scale=20, linewidth=2, zorder=3
    )
    ax.add_patch(arrow)

# Draw Lifelines
draw_lifeline(2, "Client / Browser")
draw_lifeline(6, "GloBus Node.js Server")
draw_lifeline(10, "MongoDB")
draw_lifeline(14, "SSLCommerz API")

# Draw Activations
# Client
draw_activation(2, 12.2, 5.8)
# Server
draw_activation(6, 12.2, 6.8) # Initiate Phase
draw_activation(6, 5.2, 1.8)  # IPN Phase
# DB
draw_activation(10, 11.2, 9.8) # Save Pending Order
draw_activation(10, 2.2, 1.8)  # Save Paid Order
# SSLCommerz
draw_activation(14, 9.2, 7.8) # Generate Session
draw_activation(14, 6.2, 4.8) # User Pays & IPN
draw_activation(14, 4.2, 2.8) # Validation

# Draw Messages (Top to bottom)
draw_message(2, 6, 12.0, "1. Initiate Payment (Cart Data)")
draw_message(6, 10, 11.0, "2. Create Order (Status: Pending)")
draw_message(10, 6, 10.0, "3. Return OrderID", is_return=True)

draw_message(6, 14, 9.0, "4. Request Session URL (TrxID, Amount)")
draw_message(14, 6, 8.0, "5. Return Gateway URL", is_return=True)
draw_message(6, 2, 7.0, "6. Redirect to Gateway URL", is_return=True)

draw_message(2, 14, 6.0, "7. User Submits Payment on Gateway")

draw_message(14, 6, 5.0, "8. IPN Webhook POST (Trx Status)")
draw_message(6, 14, 4.0, "9. Validate Transaction via API")
draw_message(14, 6, 3.0, "10. Verification Result (Valid)", is_return=True)

draw_message(6, 10, 2.0, "11. Update Order (Status: Paid/Failed)")

plt.title("Sequence Diagram of Payment Gateway Integration", fontsize=24, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig(r'd:\Project\GloBus\Globus Latex\images\sequence_diagram.png', dpi=300, bbox_inches='tight')
print("Successfully generated sequence_diagram.png")
