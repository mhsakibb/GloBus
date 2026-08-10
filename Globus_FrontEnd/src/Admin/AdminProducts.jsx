import React, { useState, useEffect, useRef } from "react";

// Backend Api
const API_URL = import.meta.env.VITE_API_URL;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const formRef = useRef(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    subCategory: "",
    brand: "",
    images: [],
    stock: "",
    unit: "",
    tags: "",
    variants: [],
    specifications: {
      material: "",
      weight: "",
      dimensions: "",
      origin: "",
      washable: "",
    },
    shipping: { weight: "", height: "", width: "", deliveryTime: "" },
    seo: { metaTitle: "", metaDescription: "", metaKeywords: [] },
    flashSale: { isActive: false, startDate: "", endDate: "", flashPrice: "" },
    wholesale: [],
    isFeatured: false,
    isActive: true,
    offerText: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const [customSubCategories, setCustomSubCategories] = useState([]);

  const menuData = [
    {
      name: "Food",
      icon: "/Images/ImageMenu/healthy-food.png",
      subMenu: ["Fruits", "Vegetables", "Snacks"],
    },
    {
      name: "Kitchen Utils",
      icon: "/Images/ImageMenu/kitchen.png",
      subMenu: ["Pots & Pans", "Cutlery", "Appliances"],
    },
    {
      name: "Fashion",
      icon: "/Images/ImageMenu/fashion.png",
      subMenu: ["Men", "Women", "Kids"],
    },
    {
      name: "Skin Care",
      icon: "/Images/ImageMenu/skin-care.png",
      subMenu: ["Creams", "Lotions", "Oils"],
    },
    {
      name: "Electronics",
      icon: "/Images/ImageMenu/device.png",
      subMenu: ["Mobiles", "Laptops", "Cameras"],
    },
    {
      name: "Stationary",
      icon: "/Images/ImageMenu/stationary.png",
      subMenu: ["Pens", "Notebooks", "Art Supplies"],
    },
    {
      name: "Toys",
      icon: "/Images/ImageMenu/teddy-bear.png",
      subMenu: ["Soft Toys", "Educational", "Action Figures"],
    },
  ];

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/browseProduct`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Dynamic array handlers
  const addImage = () =>
    setFormData({ ...formData, images: [...formData.images, ""] });
  const updateImage = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };
  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const addVariant = () =>
    setFormData({
      ...formData,
      variants: [...formData.variants, { color: "", size: "", stock: "" }],
    });
  const updateVariant = (index, key, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][key] = value;
    setFormData({ ...formData, variants: newVariants });
  };
  const removeVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  // Category handlers
  const handleCategorySelect = (category) => {
    setFormData({ ...formData, category, subCategory: "" });
    setShowCategoryDropdown(false);
  };

  const handleSubCategorySelect = (subCategory) => {
    setFormData({ ...formData, subCategory });
    setShowSubCategoryDropdown(false);
  };

  const handleCategoryInput = (e) => {
    setFormData({ ...formData, category: e.target.value });
  };

  const handleSubCategoryInput = (e) => {
    setFormData({ ...formData, subCategory: e.target.value });
  };

  const handleCategoryKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newCategory = e.target.value.trim();
      if (newCategory && !customCategories.includes(newCategory)) {
        setCustomCategories([...customCategories, newCategory]);
      }
      setShowCategoryDropdown(false);
    }
  };

  const handleSubCategoryKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newSubCategory = e.target.value.trim();
      if (newSubCategory && !customSubCategories.includes(newSubCategory)) {
        setCustomSubCategories([...customSubCategories, newSubCategory]);
      }
      setShowSubCategoryDropdown(false);
    }
  };

  const getSubCategories = () => {
    const category = menuData.find((item) => item.name === formData.category);
    const baseSubCategories = category ? category.subMenu : [];
    return [...baseSubCategories, ...customSubCategories];
  };

  const getAllCategories = () => {
    const baseCategories = menuData.map((item) => item.name);
    return [...baseCategories, ...customCategories];
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".category-dropdown")) {
        setShowCategoryDropdown(false);
      }
      if (!event.target.closest(".subcategory-dropdown")) {
        setShowSubCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Delete product
  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await fetch(`${API_URL}/products/${id}`, {
          method: "DELETE",
        });
        if (res.ok) fetchProducts();
      } catch (err) {
        console.log(err);
      }
    }
  };

  // Load product into form for editing
  const handleEditProduct = (product) => {
    setFormData({
      ...product,
      tags: Array.isArray(product.tags)
        ? product.tags.join(", ")
        : product.tags,
    });
    setActiveTab("basic");
    setIsEditing(true);
    setEditingProductId(product._id);
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      discountPrice: "",
      category: "",
      subCategory: "",
      brand: "",
      images: [],
      stock: "",
      unit: "",
      tags: "",
      variants: [],
      specifications: {
        material: "",
        weight: "",
        dimensions: "",
        origin: "",
        washable: "",
      },
      shipping: { weight: "", height: "", width: "", deliveryTime: "" },
      seo: { metaTitle: "", metaDescription: "", metaKeywords: [] },
      flashSale: {
        isActive: false,
        startDate: "",
        endDate: "",
        flashPrice: "",
      },
      wholesale: [],
      isFeatured: false,
      isActive: true,
      offerText: "",
    });
    setIsEditing(false);
    setEditingProductId(null);
  };

  // Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.name.trim() ||
      !formData.category.trim() ||
      !formData.subCategory.trim() ||
      !formData.stock ||
      !formData.unit.trim() ||
      !formData.price ||
      formData.images.length === 0 ||
      formData.images.some((img) => img.trim() === "")
    ) {
      alert(
        "Please fill all required fields: Name, Category, SubCategory, Stock, Unit, Price, and at least one Image",
      );
      return;
    }

    const body = {
      ...formData,
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
      reviews: [],
      faq: [],
      relatedProducts: [],
      ratings: { average: 0, count: 0 },
    };

    try {
      if (isEditing && editingProductId) {
        const updateBody = { ...body };
        delete updateBody._id;

        const res = await fetch(`${API_URL}/products/${editingProductId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateBody),
        });

        if (res.ok) {
          alert("Product updated successfully");
          resetForm();
          fetchProducts();
        }
      } else {
        const res = await fetch(`${API_URL}/addProducts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          alert("Product added successfully");
          resetForm();
          fetchProducts();
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const unitOptions = ["kg", "litre", "piece", "pack", "box"];

  return (
    <div className="animate-fade-in-up font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Product Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your catalog, add new products, and control inventory.</p>
        </div>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/20 w-full sm:w-auto"
        >
          {isFormVisible ? "Cancel / Hide Form" : "+ Add New Product"}
        </button>
      </div>

      {/* Form Section */}
      {isFormVisible && (
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden min-h-[600px]">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
            <h2 className="text-xl font-semibold">
              {isEditing ? "Update Product" : "Add New Product"}
            </h2>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              {[
                { id: "basic", label: "Basic Info" },
                { id: "pricing", label: "Pricing" },
                { id: "variants", label: "Variants" },
                { id: "specs", label: "Specifications" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === tab.id
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form ref={formRef} className="p-6" onSubmit={handleSubmit}>
            {/* Basics */}
            {activeTab === "basic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      placeholder="Enter product name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-4/5 rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Product description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-4/5 rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                    />
                  </div>

                  <div className="relative category-dropdown">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <input
                      placeholder="Select or type category"
                      name="category"
                      value={formData.category}
                      onChange={handleCategoryInput}
                      onFocus={() => setShowCategoryDropdown(true)}
                      onKeyPress={handleCategoryKeyPress}
                      required
                      className="w-4/5 rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                    />
                    {showCategoryDropdown && (
                      <div className="absolute z-50 w-4/5 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {getAllCategories().map((category) => (
                          <div
                            key={category}
                            onClick={() => handleCategorySelect(category)}
                            className="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex items-center gap-2 text-black"
                          >
                            <span>{category}</span>
                            {customCategories.includes(category) && (
                              <span className="text-xs text-gray-500">
                                (Custom)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative subcategory-dropdown">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub Category *
                    </label>
                    <input
                      placeholder="Select or type sub category"
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={handleSubCategoryInput}
                      onFocus={() => setShowSubCategoryDropdown(true)}
                      onKeyPress={handleSubCategoryKeyPress}
                      disabled={!formData.category}
                      required
                      className="w-4/5 rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500 disabled:bg-gray-100"
                    />
                    {showSubCategoryDropdown && formData.category && (
                      <div className="absolute z-40 w-4/5 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {getSubCategories().map((subCategory) => (
                          <div
                            key={subCategory}
                            onClick={() => handleSubCategorySelect(subCategory)}
                            className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-black"
                          >
                            {subCategory}
                            {customSubCategories.includes(subCategory) && (
                              <span className="text-xs text-gray-500 ml-2">
                                (Custom)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      placeholder="Brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-4/5 rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-4/5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock *
                      </label>
                      <input
                        placeholder="Stock"
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit *
                      </label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black"
                      >
                        <option value="" className="text-gray-500">
                          Select Unit
                        </option>
                        {unitOptions.map((u) => (
                          <option key={u} value={u} className="text-black">
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      placeholder="Tags (comma separated)"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className="w-4/5 rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images *
                    </label>
                    <div className="space-y-2 w-4/5">
                      {formData.images.map((img, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            className="flex-1 rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                            value={img}
                            onChange={(e) => updateImage(i, e.target.value)}
                            placeholder="Image URL"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="bg-red-500 text-white px-3 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addImage}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                      >
                        Add Image URL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing */}
            {activeTab === "pricing" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <div className="relative w-4/5">
                      <span className="absolute left-3 top-2 text-gray-500">
                        ৳
                      </span>
                      <input
                        placeholder="0.00"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg pl-8 pr-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Price
                    </label>
                    <div className="relative w-4/5">
                      <span className="absolute left-3 top-2 text-gray-500">
                        ৳
                      </span>
                      <input
                        placeholder="0.00"
                        name="discountPrice"
                        type="number"
                        step="0.01"
                        value={formData.discountPrice}
                        onChange={handleChange}
                        className="w-full rounded-lg pl-8 pr-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Offer Text
                    </label>
                    <input
                      placeholder="Special offer text"
                      name="offerText"
                      value={formData.offerText}
                      onChange={handleChange}
                      className="w-4/5 rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                    />
                  </div>

                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isFeatured"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Feature this product
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Variants */}
            {activeTab === "variants" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Product Variants
                  </h3>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Add Variant
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.variants.map((v, i) => (
                    <div
                      key={i}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color
                          </label>
                          <input
                            placeholder="Color"
                            value={v.color}
                            onChange={(e) =>
                              updateVariant(i, "color", e.target.value)
                            }
                            className="w-full rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Size
                          </label>
                          <input
                            placeholder="Size"
                            value={v.size}
                            onChange={(e) =>
                              updateVariant(i, "size", e.target.value)
                            }
                            className="w-full rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock
                          </label>
                          <input
                            placeholder="Stock"
                            type="number"
                            value={v.stock}
                            onChange={(e) =>
                              updateVariant(i, "stock", e.target.value)
                            }
                            className="w-full rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end mt-3">
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                        >
                          Remove Variant
                        </button>
                      </div>
                    </div>
                  ))}

                  {formData.variants.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500">
                        No variants added yet. Click "Add Variant" to create
                        one.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Specification */}
            {activeTab === "specs" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Product Specifications
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material
                    </label>
                    <input
                      placeholder="Material"
                      value={formData.specifications.material}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specifications: {
                            ...formData.specifications,
                            material: e.target.value,
                          },
                        })
                      }
                      className="w-4/5 rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight
                    </label>
                    <input
                      placeholder="Weight"
                      value={formData.specifications.weight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specifications: {
                            ...formData.specifications,
                            weight: e.target.value,
                          },
                        })
                      }
                      className="w-4/5 rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dimensions
                    </label>
                    <input
                      placeholder="Dimensions"
                      value={formData.specifications.dimensions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specifications: {
                            ...formData.specifications,
                            dimensions: e.target.value,
                          },
                        })
                      }
                      className="w-4/5 rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 mt-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Origin
                    </label>
                    <input
                      placeholder="Origin"
                      value={formData.specifications.origin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specifications: {
                            ...formData.specifications,
                            origin: e.target.value,
                          },
                        })
                      }
                      className="w-4/5 rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Washable
                    </label>
                    <input
                      placeholder="Washable"
                      value={formData.specifications.washable}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specifications: {
                            ...formData.specifications,
                            washable: e.target.value,
                          },
                        })
                      }
                      className="w-4/5 rounded-lg px-4 py-2 bg-gray-50 transition shadow-sm text-black placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
              <div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormVisible(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                >
                  {isEditing ? "Update Product" : "Add Product"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 overflow-hidden mt-8">
        <div className="border-b border-slate-100 dark:border-slate-800/60 p-6 flex flex-col sm:flex-row justify-between items-center bg-slate-50 dark:bg-slate-900/50 gap-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            All Products <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">({products.length} items)</span>
          </h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full sm:w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-700 dark:text-slate-200 placeholder-slate-400" 
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50/50 dark:bg-[#0B1120]/50">
          {products.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No products found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">Your catalog is currently empty. Click the button above to add your first product.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <div
                  key={p._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={p.images?.[0] || "/placeholder-image.jpg"}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {p.isFeatured && (
                        <span className="bg-amber-500/90 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg shadow-sm">
                          Featured
                        </span>
                      )}
                      {p.discountPrice && (
                        <span className="bg-rose-500/90 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg shadow-sm">
                          Sale
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 mb-1 uppercase tracking-wider">
                        {p.category}
                      </p>
                      <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight line-clamp-1 group-hover:text-indigo-500 transition-colors">
                        {p.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-slate-800 dark:text-white">
                          ৳{p.discountPrice || p.price}
                        </span>
                        {p.discountPrice && (
                          <span className="text-sm font-medium text-slate-400 line-through decoration-slate-400/50">
                            ৳{p.price}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg border ${
                        p.stock > 0 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800/30" 
                          : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-800/30"
                      }`}>
                        {p.stock > 0 ? `${p.stock} left` : "Out of stock"}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleEditProduct(p)}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="flex-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 py-2 rounded-xl text-sm font-medium hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors border border-rose-100 dark:border-rose-800/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
