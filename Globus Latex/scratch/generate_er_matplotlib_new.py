import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(24, 20))
ax.set_xlim(-2, 24)
ax.set_ylim(0, 20)
ax.axis('off')

header_color = '#4A90E2'
body_color = '#F5F7FA'
line_color = '#333333'

def draw_table(x, y, w, title, fields):
    h = len(fields) * 0.45 + 1.2
    # Body
    ax.add_patch(patches.Rectangle((x, y), w, h, facecolor=body_color, edgecolor=line_color, linewidth=2))
    # Header
    header_h = 0.8
    ax.add_patch(patches.Rectangle((x, y + h - header_h), w, header_h, facecolor=header_color, edgecolor=line_color, linewidth=2))
    ax.text(x + w/2, y + h - header_h/2, title, ha='center', va='center', fontsize=16, fontweight='bold', color='white')
    
    # Fields
    for i, field in enumerate(fields):
        fontweight = 'bold' if "(Primary Key)" in field or "(PK)" in field else 'normal'
        ax.text(x + 0.2, y + h - header_h - 0.45 - (i * 0.45), field, ha='left', va='center', fontsize=13, fontweight=fontweight)
    return h

def draw_routing_line(points, label=None, label_pos=None):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    ax.plot(xs, ys, color=line_color, linewidth=2)
    
    # Arrow head
    dx = xs[-1] - xs[-2]
    dy = ys[-1] - ys[-2]
    length = (dx**2 + dy**2)**0.5
    if length > 0:
        dx = dx/length * 0.4
        dy = dy/length * 0.4
        ax.arrow(xs[-2], ys[-2], xs[-1]-xs[-2]-dx, ys[-1]-ys[-2]-dy, 
                 head_width=0.3, head_length=0.4, fc=line_color, ec=line_color, length_includes_head=True)
    
    if label and label_pos:
        ax.text(label_pos[0], label_pos[1], label, ha='center', va='center', fontsize=13, fontweight='bold',
                bbox=dict(facecolor='white', edgecolor='gray', boxstyle='round,pad=0.3', alpha=0.95))

w = 5.0

users_fields = ["_id: ObjectId (Primary Key)", "name: String", "email: String (Unique)", "phone: String", "password: String", "role: String", "status: String"]
news_fields = ["_id: ObjectId (Primary Key)", "email: String", "subscribedAt: Date", "isActive: Boolean", "source: String"]
cart_fields = ["_id: ObjectId (Primary Key)", "userId: String (FK -> users.email)", "productId: String (FK -> products._id)", "productName: String", "productImage: String", "price: String/Number", "originalPrice: String/Number", "discountPrice: String/Number", "brand: String", "category: String", "quantity: Number", "addedAt: Date"]
orders_fields = ["_id: ObjectId (Primary Key)", "orderNumber: String (Unique)", "userInfo: Object", "shippingInfo: Object", "items: Array (Ref products)", "orderSummary: Object", "orderStatus: String", "source: String", "timestamps: Object", "statusHistory: Array", "updatedAt: Date"]
trans_fields = ["_id: ObjectId (Primary Key)", "orderId: ObjectId (FK -> orders._id)", "orderNumber: String", "userEmail: String (FK -> users.email)", "transactionId: String", "amount: Number", "currency: String", "paymentMethod: String", "paymentStatus: String", "timestamps: Object"]
prod_fields = ["_id: ObjectId (Primary Key)", "name: String", "description: String", "price: String/Number", "discountPrice: String/Number", "category: String", "subCategory: String", "brand: String", "images: Array", "stock: String/Number", "unit: String", "tags: Array", "variants: Array", "specifications: Object", "shipping: Object", "seo: Object", "flashSale: Object", "wholesale: Array", "isFeatured: Boolean", "isActive: Boolean", "offerText: String", "reviews: Array", "faq: Array", "relatedProducts: Array", "ratings: Object", "slug: String", "createdAt: Date", "updatedAt: Date"]

draw_table(1, 14, w, "users", users_fields)
draw_table(1, 10, w, "newsletter_subscribers", news_fields)
draw_table(1, 2, w, "cart", cart_fields)

draw_table(9, 2, w, "products", prod_fields)

draw_table(17, 12, w, "orders", orders_fields)
draw_table(17, 2, w, "transactions", trans_fields)

# 1. users -> transactions (1:N)
draw_routing_line([(6, 17), (15.5, 17), (15.5, 6), (17, 6)], "1:N (userEmail)", (11, 17.5))

# 2. users -> cart (1:N)
# Over the left
draw_routing_line([(1, 16), (-0.5, 16), (-0.5, 5), (1, 5)], "1:N (userId)", (-0.5, 10.5))

# 3. orders -> transactions (1:N)
draw_routing_line([(19.5, 12), (19.5, 7.3)], "1:1 / 1:N (orderId)", (21.3, 9.6))

# 4. products -> cart (1:N)
draw_routing_line([(9, 5), (6, 5)], "1:N (productId)", (7.5, 5.5))

# 5. orders -> products (M:N)
draw_routing_line([(17, 14), (14, 14)], "Contains (items array)", (15.5, 14.5))

plt.title("Detailed Entity-Relationship (ER) Diagram - GlobusDB", fontsize=28, fontweight='bold', pad=30)
plt.tight_layout()
plt.savefig(r'd:\Project\GloBus\Globus Latex\images\er_diagram.png', dpi=300, bbox_inches='tight')
print("Successfully generated detailed er_diagram.png")
