const { ObjectId } = require("mongodb");

// Get all orders for Admin
const getAllOrders = async (req, res) => {
  try {
    const { 
      status, 
      page = 1, 
      limit = 1000, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const ordersCollection = database.collection("orders");
    
    let filter = {};
    
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }
    
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { orderNumber: { $regex: q, $options: 'i' } },
        { 'shippingInfo.fullName': { $regex: q, $options: 'i' } },
        { 'shippingInfo.email': { $regex: q, $options: 'i' } },
        { 'shippingInfo.phone': { $regex: q, $options: 'i' } },
        { 'userInfo.email': { $regex: q, $options: 'i' } }
      ];
    }
    
    const pageNum = parseInt(page) || 1;
    const limitNum = limit === 'all' || !limit ? 1000 : parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const sort = {};
    if (sortBy === 'createdAt') {
      sort['createdAt'] = sortOrder === 'asc' ? 1 : -1;
      sort['timestamps.created'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }
    
    const [orders, totalCount] = await Promise.all([
      ordersCollection.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      ordersCollection.countDocuments(filter)
    ]);

    // Ensure createdAt / timestamps are normalized on all returned objects
    const normalizedOrders = orders.map(order => {
      const dateVal = order.createdAt || order.timestamps?.created || order.updatedAt || new Date();
      return {
        ...order,
        createdAt: dateVal,
        timestamps: {
          created: order.timestamps?.created || dateVal,
          updated: order.timestamps?.updated || order.updatedAt || dateVal
        }
      };
    });
    
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.json({
      success: true,
      data: {
        orders: normalizedOrders,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum) || 1,
          totalOrders: totalCount,
          hasNext: pageNum < Math.ceil(totalCount / limitNum),
          hasPrev: pageNum > 1
        }
      },
      message: "Orders fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders: " + error.message
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format"
      });
    }
    
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const ordersCollection = database.collection("orders");
    
    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const dateVal = order.createdAt || order.timestamps?.created || order.updatedAt || new Date();
    const normalizedOrder = {
      ...order,
      createdAt: dateVal,
      timestamps: {
        created: order.timestamps?.created || dateVal,
        updated: order.timestamps?.updated || order.updatedAt || dateVal
      }
    };
    
    res.json({
      success: true,
      data: normalizedOrder,
      message: "Order fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order: " + error.message
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    console.log('Updating order status:', { id, status, adminNotes });
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format"
      });
    }
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status provided. Must be one of: " + validStatuses.join(', ')
      });
    }
    
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const ordersCollection = database.collection("orders");
    
    const existingOrder = await ordersCollection.findOne({ _id: new ObjectId(id) });
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    const updateOperation = {
      $set: {
        orderStatus: status,
        updatedAt: new Date(),
        "timestamps.updated": new Date()
      }
    };
    
    if (adminNotes) {
      updateOperation.$set.adminNotes = adminNotes;
    }
    
    const statusHistoryEntry = {
      status: status,
      updatedAt: new Date(),
      updatedBy: 'admin', 
      notes: adminNotes || ''
    };
    
    updateOperation.$push = {
      statusHistory: statusHistoryEntry
    };
    
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      updateOperation
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    const updatedOrder = await ordersCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: updatedOrder,
      message: "Order status updated successfully"
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status: " + error.message
    });
  }
};

// Get order statistics for Dashboard
const getOrderStats = async (req, res) => {
  try {
    const { period = 'all' } = req.query; 
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const ordersCollection = database.collection("orders");
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter.createdAt = { $gte: weekAgo };
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter.createdAt = { $gte: monthAgo };
        break;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dateFilter.createdAt = { $gte: yearAgo };
        break;
    }
    
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
      recentOrders
    ] = await Promise.all([
      ordersCollection.countDocuments(dateFilter),
      ordersCollection.countDocuments({ ...dateFilter, orderStatus: 'pending' }),
      ordersCollection.countDocuments({ ...dateFilter, orderStatus: 'processing' }),
      ordersCollection.countDocuments({ ...dateFilter, orderStatus: 'shipped' }),
      ordersCollection.countDocuments({ ...dateFilter, orderStatus: 'delivered' }),
      ordersCollection.countDocuments({ ...dateFilter, orderStatus: 'cancelled' }),
      ordersCollection.aggregate([
        { $match: { ...dateFilter, orderStatus: { $in: ['delivered', 'shipped', 'processing', 'pending'] } } },
        { 
          $group: { 
            _id: null, 
            totalRevenue: { 
              $sum: { 
                $toDouble: { $ifNull: ['$orderSummary.totalAmount', 0] } 
              } 
            } 
          } 
        }
      ]).toArray(),
      ordersCollection.find(dateFilter)
        .sort({ createdAt: -1, 'timestamps.created': -1 })
        .limit(6)
        .toArray()
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? (revenueResult[0].totalRevenue || 0) : 0;
    
    // Get monthly revenue for charts with robust date parsing
    const monthlyRevenue = await ordersCollection.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      {
        $project: {
          totalAmount: { $toDouble: { $ifNull: ['$orderSummary.totalAmount', 0] } },
          date: {
            $convert: {
              input: { $ifNull: ['$createdAt', '$timestamps.created'] },
              to: 'date',
              onError: new Date(),
              onNull: new Date()
            }
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]).toArray();
    
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.json({
      success: true,
      data: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        totalRevenue: totalRevenue,
        revenue: totalRevenue,
        recentOrders: recentOrders,
        monthlyRevenue: monthlyRevenue,
        period: period
      },
      message: "Order statistics fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order statistics: " + error.message
    });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format"
      });
    }
    
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const ordersCollection = database.collection("orders");
    
    const result = await ordersCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    res.json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order: " + error.message
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  deleteOrder,
};