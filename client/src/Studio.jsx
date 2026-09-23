import React, { useState, useRef, useEffect } from 'react';
import './Studio.css';
import { API_BASE_URL } from './config';
import { PREDEFINED_DESIGNS } from './designsData';

const Studio = ({ product, user, initialCustomization, onBack, onCartUpdated, onNavigateToCart }) => {
  const availableSizes = product && product.variants
    ? Array.from(new Set(product.variants.map((v) => v.size)))
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const availableColours = product && product.variants
    ? Array.from(new Set(product.variants.map((v) => v.colour)))
    : ['Black', 'White', 'Navy'];

  const [selectedSize, setSelectedSize] = useState(
    initialCustomization && initialCustomization.size
      ? initialCustomization.size
      : availableSizes[0] || 'M'
  );
  const [selectedColour, setSelectedColour] = useState(
    initialCustomization && initialCustomization.colour
      ? initialCustomization.colour
      : availableColours[0] || 'Black'
  );

  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [activeTab, setActiveTab] = useState('text');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [uploadError, setUploadError] = useState(null);

  const [customizationId, setCustomizationId] = useState(
    initialCustomization && initialCustomization._id ? initialCustomization._id : null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const printAreaRef = useRef(null);
  const dragRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialCustomization && initialCustomization.layers) {
      const restoredLayers = initialCustomization.layers.map((l, index) => {
        const layerId = l._id ? l._id.toString() : l.id || `layer_${Date.now()}_${index}`;

        if (l.type === 'predefined_design' && l.design) {
          const matchedDesign = PREDEFINED_DESIGNS.find(
            (d) => d.id === l.design.designId
          );
          return {
            ...l,
            id: layerId,
            design: {
              ...l.design,
              svg: l.design.svg || (matchedDesign ? matchedDesign.svg : '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="currentColor"/></svg>'),
              name: l.design.name || (matchedDesign ? matchedDesign.name : 'Design Layer'),
            },
          };
        }

        if (l.type === 'uploaded_image' && l.image) {
          return {
            ...l,
            id: layerId,
            image: {
              ...l.image,
              name: l.image.name || 'Uploaded Image',
            },
          };
        }

        return {
          ...l,
          id: layerId,
        };
      });

      setLayers(restoredLayers);
      if (initialCustomization._id) {
        setCustomizationId(initialCustomization._id);
      }
    }
  }, [initialCustomization]);

  if (!product) {
    return (
      <div className="studio-container studio-empty">
        <div className="studio-card">
          <h2>No Product Selected</h2>
          <p>Please select a product from the catalog to open in ANIVOM Studio.</p>
          <button className="studio-btn studio-btn-primary" onClick={onBack}>
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : null;

  const colourMap = {
    Black: '#18181b',
    White: '#f8fafc',
    Red: '#ef4444',
    Blue: '#3b82f6',
    Green: '#22c55e',
    Yellow: '#eab308',
    Orange: '#f97316',
    Pink: '#ec4899',
    Purple: '#a855f7',
    Maroon: '#800000',
    Navy: '#1e3a8a',
    Grey: '#64748b',
    Brown: '#78350f',
    Beige: '#f5f5dc',
    Cream: '#fffdd0',
    Teal: '#14b8a6',
    Mustard: '#d97706',
    Olive: '#65a30d',
    'Sky Blue': '#0ea5e9',
    Wine: '#722f37',
  };

  const garmentColor = colourMap[selectedColour] || '#18181b';

  const categories = ['All', 'Minimal', 'Graphic', 'Typography', 'Tamil-inspired'];

  const filteredDesigns = selectedCategory === 'All'
    ? PREDEFINED_DESIGNS
    : PREDEFINED_DESIGNS.filter((d) => d.category === selectedCategory);

  const handleAddTextLayer = () => {
    const newLayer = {
      id: 'text_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'text',
      order: layers.length + 1,
      position: { x: 50, y: 50 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      text: {
        content: 'YOUR TEXT',
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#ffffff',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
      },
    };

    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const handleAddDesignLayer = (designObj) => {
    const newLayer = {
      id: 'design_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'predefined_design',
      order: layers.length + 1,
      position: { x: 50, y: 50 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      design: {
        designId: designObj.id,
        name: designObj.name,
        svg: designObj.svg,
        color: '#ffffff',
      },
    };

    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const handleImageFileSelect = (e) => {
    setUploadError(null);
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file format. Please select PNG, JPG, JPEG, or WEBP.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setUploadError('File size exceeds 5 MB. Please select a smaller image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const tempUrl = URL.createObjectURL(file);

    const newLayer = {
      id: 'image_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'uploaded_image',
      order: layers.length + 1,
      position: { x: 50, y: 50 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      image: {
        url: tempUrl,
        name: file.name,
        isTemp: true,
      },
    };

    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateSelectedLayerText = (key, value) => {
    if (!selectedLayerId) return;
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.id === selectedLayerId && layer.type === 'text') {
          return {
            ...layer,
            text: {
              ...layer.text,
              [key]: value,
            },
          };
        }
        return layer;
      })
    );
  };

  const updateSelectedLayerDesignColor = (color) => {
    if (!selectedLayerId) return;
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.id === selectedLayerId && layer.type === 'predefined_design') {
          return {
            ...layer,
            design: {
              ...layer.design,
              color,
            },
          };
        }
        return layer;
      })
    );
  };

  const updateSelectedLayerTransform = (key, value) => {
    if (!selectedLayerId) return;
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.id === selectedLayerId) {
          return {
            ...layer,
            [key]: value,
          };
        }
        return layer;
      })
    );
  };

  const handleDeleteLayer = (idToDelete) => {
    const targetId = idToDelete || selectedLayerId;
    if (!targetId) return;

    const layerToDelete = layers.find((l) => l.id === targetId);
    if (layerToDelete && layerToDelete.type === 'uploaded_image' && layerToDelete.image && layerToDelete.image.url) {
      if (layerToDelete.image.url.startsWith('blob:')) {
        URL.revokeObjectURL(layerToDelete.image.url);
      }
    }

    setLayers((prev) => {
      const filtered = prev.filter((l) => l.id !== targetId);
      return filtered.map((layer, index) => ({
        ...layer,
        order: index + 1,
      }));
    });

    if (selectedLayerId === targetId) {
      setSelectedLayerId(null);
    }
  };

  const moveLayerOrder = (direction) => {
    if (!selectedLayerId) return;
    const currentIndex = layers.findIndex((l) => l.id === selectedLayerId);
    if (currentIndex === -1) return;

    const newLayers = [...layers];

    if (direction === 'forward') {
      if (currentIndex === newLayers.length - 1) return;
      const temp = newLayers[currentIndex];
      newLayers[currentIndex] = newLayers[currentIndex + 1];
      newLayers[currentIndex + 1] = temp;
    } else if (direction === 'backward') {
      if (currentIndex === 0) return;
      const temp = newLayers[currentIndex];
      newLayers[currentIndex] = newLayers[currentIndex - 1];
      newLayers[currentIndex - 1] = temp;
    } else if (direction === 'front') {
      if (currentIndex === newLayers.length - 1) return;
      const [target] = newLayers.splice(currentIndex, 1);
      newLayers.push(target);
    } else if (direction === 'back') {
      if (currentIndex === 0) return;
      const [target] = newLayers.splice(currentIndex, 1);
      newLayers.unshift(target);
    }

    const reordered = newLayers.map((layer, index) => ({
      ...layer,
      order: index + 1,
    }));

    setLayers(reordered);
  };

  const saveCustomizationInternal = async () => {
    if (!user) {
      throw new Error('You must be logged in to save a customization.');
    }

    if (!product || !product._id) {
      throw new Error('No product selected.');
    }

    if (!selectedSize) {
      throw new Error('Please select a size.');
    }

    if (!selectedColour) {
      throw new Error('Please select a colour.');
    }

    const sanitizedLayers = layers.map((layer) => {
      if (layer.type === 'uploaded_image') {
        return {
          ...layer,
          image: {
            ...layer.image,
            url: layer.image.url && layer.image.url.startsWith('blob:')
              ? '/uploads/temp-placeholder.png'
              : layer.image.url,
          },
        };
      }
      return layer;
    });

    const payload = {
      product: product._id,
      size: selectedSize,
      colour: selectedColour,
      layers: sanitizedLayers,
      status: 'saved',
    };

    const url = customizationId
      ? `${API_BASE_URL}/api/v1/customizations/${customizationId}`
      : `${API_BASE_URL}/api/v1/customizations`;

    const method = customizationId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to save customization.');
    }

    const savedId = customizationId || (data.data && data.data.customization ? data.data.customization._id : null);
    if (!customizationId && savedId) {
      setCustomizationId(savedId);
    }

    return data.data ? data.data.customization : { _id: savedId };
  };

  const handleSaveCustomization = async () => {
    setSaveMessage(null);
    setSaveError(null);

    if (isSaving) return;
    setIsSaving(true);

    try {
      await saveCustomizationInternal();
      setSaveMessage(
        customizationId
          ? 'Customization updated successfully!'
          : 'Customization saved successfully!'
      );
    } catch (err) {
      setSaveError(err.message || 'Error communicating with customization API.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToCartCustomized = async () => {
    if (!user) {
      setSaveError('Please log in to add customized products to your cart.');
      return;
    }

    if (isAddingToCart || isSaving) return;
    setIsAddingToCart(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      let activeCustomizationId = customizationId;
      if (!activeCustomizationId) {
        const savedDoc = await saveCustomizationInternal();
        activeCustomizationId = savedDoc._id;
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          product: product._id,
          size: selectedSize,
          colour: selectedColour,
          quantity: 1,
          customized: true,
          customization: activeCustomizationId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add customized design to cart.');
      }

      setSaveMessage('Customized design added to shopping cart!');
      if (onCartUpdated) onCartUpdated();
      if (onNavigateToCart) {
        setTimeout(() => {
          onNavigateToCart();
        }, 1200);
      }
    } catch (err) {
      setSaveError(err.message || 'Error adding customized design to cart.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  const handlePointerDown = (e, layer) => {
    e.stopPropagation();
    setSelectedLayerId(layer.id);

    if (!printAreaRef.current) return;
    const bounds = printAreaRef.current.getBoundingClientRect();

    dragRef.current = {
      layerId: layer.id,
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: layer.position.x,
      initialPosY: layer.position.y,
      boundsWidth: bounds.width,
      boundsHeight: bounds.height,
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;

    const { layerId, startX, startY, initialPosX, initialPosY, boundsWidth, boundsHeight } = dragRef.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newX = initialPosX + deltaX;
    let newY = initialPosY + deltaY;

    const minX = 0;
    const maxX = boundsWidth;
    const minY = 0;
    const maxY = boundsHeight;

    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));

    setLayers((prevLayers) =>
      prevLayers.map((l) => {
        if (l.id === layerId) {
          return {
            ...l,
            position: { x: Math.round(newX), y: Math.round(newY) },
          };
        }
        return l;
      })
    );
  };

  const handlePointerUp = () => {
    dragRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className="studio-root">
      <header className="studio-header">
        <div className="studio-header-left">
          <button className="studio-back-btn" onClick={onBack}>
            &larr; Catalog
          </button>
          <div className="studio-brand-group">
            <span className="studio-badge">ANIVOM STUDIO</span>
            <span className="studio-tagline">Make something that's yours.</span>
          </div>
        </div>

        <div className="studio-header-center">
          <h1 className="studio-product-name">{product.name}</h1>
          <span className="studio-price">&#8377;{product.basePrice}</span>
        </div>

        <div className="studio-header-actions">
          <button
            className="save-customization-btn"
            onClick={handleSaveCustomization}
            disabled={isSaving || isAddingToCart}
          >
            {isSaving ? 'Saving...' : customizationId ? 'Save Changes' : 'Save Customization'}
          </button>
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCartCustomized}
            disabled={isSaving || isAddingToCart}
          >
            {isAddingToCart ? 'Adding...' : 'Add Design to Bag'}
          </button>
        </div>
      </header>

      {(saveMessage || saveError) && (
        <div className="studio-banner-messages">
          {saveMessage && <div className="banner-message success">{saveMessage}</div>}
          {saveError && <div className="banner-message error">{saveError}</div>}
        </div>
      )}

      <div className="studio-main-layout">
        <div className="studio-preview-section">
          <div className="studio-canvas-container">
            <div
              className="garment-base"
              style={{ backgroundColor: garmentColor }}
            >
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="product-image-overlay"
                />
              ) : (
                <div className="tshirt-silhouette-fallback">
                  <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="silhouette-svg"
                  >
                    <path d="M 30 15 Q 50 25 70 15 L 85 30 L 75 40 L 70 35 L 70 85 L 30 85 L 30 35 L 25 40 L 15 30 Z" />
                  </svg>
                </div>
              )}

              <div
                className="design-print-area"
                ref={printAreaRef}
                onClick={() => setSelectedLayerId(null)}
              >
                <div className="print-area-dashed-border">
                  {layers.length === 0 && (
                    <span className="print-area-label">Print Area</span>
                  )}
                </div>

                {layers.map((layer) => {
                  const isSelected = layer.id === selectedLayerId;
                  const scaleVal = layer.scale ? layer.scale.x : 1;
                  const rotVal = layer.rotation || 0;

                  return (
                    <div
                      key={layer.id}
                      className={`canvas-text-layer ${isSelected ? 'selected' : ''}`}
                      style={{
                        left: `${layer.position.x}px`,
                        top: `${layer.position.y}px`,
                        transform: `translate(-50%, -50%) rotate(${rotVal}deg) scale(${scaleVal})`,
                        zIndex: layer.order,
                      }}
                      onPointerDown={(e) => handlePointerDown(e, layer)}
                    >
                      {layer.type === 'text' && (
                        <span
                          style={{
                            fontFamily: layer.text.fontFamily,
                            fontSize: `${layer.text.fontSize}px`,
                            color: layer.text.color,
                            fontWeight: layer.text.fontWeight,
                            fontStyle: layer.text.fontStyle,
                            textAlign: layer.text.textAlign,
                            display: 'inline-block',
                          }}
                        >
                          {layer.text.content || 'TEXT'}
                        </span>
                      )}

                      {layer.type === 'predefined_design' && (
                        <div
                          className="design-layer-container"
                          style={{ color: layer.design.color || '#ffffff' }}
                          dangerouslySetInnerHTML={{ __html: layer.design.svg }}
                        />
                      )}

                      {layer.type === 'uploaded_image' && (
                        <div className="image-layer-container">
                          <img
                            src={layer.image.url}
                            alt="Uploaded artwork"
                            className="uploaded-canvas-img"
                          />
                        </div>
                      )}

                      {isSelected && (
                        <div className="layer-selection-box">
                          <span className="selection-handle top-left"></span>
                          <span className="selection-handle top-right"></span>
                          <span className="selection-handle bottom-left"></span>
                          <span className="selection-handle bottom-right"></span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="studio-preview-meta">
            <div className="meta-chip">
              <span>Color: <strong>{selectedColour}</strong></span>
            </div>
            <div className="meta-chip">
              <span>Size: <strong>{selectedSize}</strong></span>
            </div>
            <div className="meta-chip">
              <span>Layers: <strong>{layers.length}</strong></span>
            </div>
          </div>
        </div>

        <aside className="studio-controls-sidebar">
          <div className="studio-panel-section">
            <div className="tab-navigation">
              <button
                className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
                onClick={() => setActiveTab('text')}
              >
                Text
              </button>
              <button
                className={`tab-btn ${activeTab === 'designs' ? 'active' : ''}`}
                onClick={() => setActiveTab('designs')}
              >
                Designs
              </button>
              <button
                className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                Upload
              </button>
            </div>

            {activeTab === 'text' && (
              <div>
                <div className="panel-section-header">
                  <h3>Text Customization</h3>
                  <button className="add-text-btn" onClick={handleAddTextLayer}>
                    + Add Text
                  </button>
                </div>

                {selectedLayer && selectedLayer.type === 'text' ? (
                  <div className="text-editor-controls">
                    <div className="editor-title-bar">
                      <span className="editor-title">Edit Text Layer</span>
                      <button
                        className="delete-layer-btn"
                        onClick={() => handleDeleteLayer(selectedLayer.id)}
                        title="Delete layer"
                      >
                        Delete ✕
                      </button>
                    </div>

                    <div className="control-group">
                      <label>Content</label>
                      <input
                        type="text"
                        className="text-input"
                        value={selectedLayer.text.content}
                        onChange={(e) => updateSelectedLayerText('content', e.target.value)}
                      />
                    </div>

                    <div className="control-row">
                      <div className="control-group flex-1">
                        <label>Font Family</label>
                        <select
                          className="select-input"
                          value={selectedLayer.text.fontFamily}
                          onChange={(e) => updateSelectedLayerText('fontFamily', e.target.value)}
                        >
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Trebuchet MS">Trebuchet MS</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Impact">Impact</option>
                        </select>
                      </div>

                      <div className="control-group flex-1">
                        <label>Font Size</label>
                        <input
                          type="number"
                          className="text-input"
                          min="10"
                          max="72"
                          value={selectedLayer.text.fontSize}
                          onChange={(e) => updateSelectedLayerText('fontSize', Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="control-row">
                      <div className="control-group flex-1">
                        <label>Text Color</label>
                        <input
                          type="color"
                          className="color-input"
                          value={selectedLayer.text.color}
                          onChange={(e) => updateSelectedLayerText('color', e.target.value)}
                        />
                      </div>

                      <div className="control-group flex-1">
                        <label>Alignment</label>
                        <select
                          className="select-input"
                          value={selectedLayer.text.textAlign}
                          onChange={(e) => updateSelectedLayerText('textAlign', e.target.value)}
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>

                    <div className="control-row">
                      <div className="control-group flex-1">
                        <label>Weight</label>
                        <select
                          className="select-input"
                          value={selectedLayer.text.fontWeight}
                          onChange={(e) => updateSelectedLayerText('fontWeight', e.target.value)}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                        </select>
                      </div>

                      <div className="control-group flex-1">
                        <label>Style</label>
                        <select
                          className="select-input"
                          value={selectedLayer.text.fontStyle}
                          onChange={(e) => updateSelectedLayerText('fontStyle', e.target.value)}
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Italic</option>
                        </select>
                      </div>
                    </div>

                    <div className="control-group">
                      <label>Scale ({selectedLayer.scale ? selectedLayer.scale.x.toFixed(1) : 1}x)</label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        className="range-input"
                        value={selectedLayer.scale ? selectedLayer.scale.x : 1}
                        onChange={(e) =>
                          updateSelectedLayerTransform('scale', {
                            x: parseFloat(e.target.value),
                            y: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="control-group">
                      <label>Rotation ({selectedLayer.rotation || 0}°)</label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        className="range-input"
                        value={selectedLayer.rotation || 0}
                        onChange={(e) =>
                          updateSelectedLayerTransform('rotation', parseInt(e.target.value, 10))
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="empty-tools-state">
                    <p>Click <strong>+ Add Text</strong> to create a text layer or select an existing layer to edit styling, size, and rotation.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'designs' && (
              <div>
                <div className="panel-section-header">
                  <h3>Predefined Designs</h3>
                </div>

                <div className="category-filter-bar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="designs-grid">
                  {filteredDesigns.map((d) => (
                    <div
                      key={d.id}
                      className="design-card"
                      onClick={() => handleAddDesignLayer(d)}
                      title={`Add ${d.name}`}
                    >
                      <div
                        className="design-card-preview"
                        dangerouslySetInnerHTML={{ __html: d.svg }}
                      />
                      <span className="design-card-name">{d.name}</span>
                    </div>
                  ))}
                </div>

                {selectedLayer && selectedLayer.type === 'predefined_design' && (
                  <div className="design-editor-controls">
                    <div className="editor-title-bar">
                      <span className="editor-title">Edit Design Layer</span>
                      <button
                        className="delete-layer-btn"
                        onClick={() => handleDeleteLayer(selectedLayer.id)}
                        title="Delete design layer"
                      >
                        Delete ✕
                      </button>
                    </div>

                    <div className="control-group">
                      <label>Color</label>
                      <input
                        type="color"
                        className="color-input"
                        value={selectedLayer.design.color || '#ffffff'}
                        onChange={(e) => updateSelectedLayerDesignColor(e.target.value)}
                      />
                    </div>

                    <div className="control-group">
                      <label>Scale ({selectedLayer.scale ? selectedLayer.scale.x.toFixed(1) : 1}x)</label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        className="range-input"
                        value={selectedLayer.scale ? selectedLayer.scale.x : 1}
                        onChange={(e) =>
                          updateSelectedLayerTransform('scale', {
                            x: parseFloat(e.target.value),
                            y: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="control-group">
                      <label>Rotation ({selectedLayer.rotation || 0}°)</label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        className="range-input"
                        value={selectedLayer.rotation || 0}
                        onChange={(e) =>
                          updateSelectedLayerTransform('rotation', parseInt(e.target.value, 10))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'upload' && (
              <div>
                <div className="panel-section-header">
                  <h3>Custom Image Upload</h3>
                </div>

                <div className="upload-dropzone">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleImageFileSelect}
                    style={{ display: 'none' }}
                  />
                  <button
                    className="upload-action-btn"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    Select Image File
                  </button>
                  <p className="upload-hints">Supports PNG, JPG, JPEG, WEBP (Max 5 MB)</p>
                </div>

                {uploadError && (
                  <div className="upload-error-box">
                    <span>{uploadError}</span>
                  </div>
                )}

                {selectedLayer && selectedLayer.type === 'uploaded_image' ? (
                  <div className="image-editor-controls">
                    <div className="editor-title-bar">
                      <span className="editor-title">Edit Image Layer</span>
                      <button
                        className="delete-layer-btn"
                        onClick={() => handleDeleteLayer(selectedLayer.id)}
                        title="Delete image layer"
                      >
                        Delete ✕
                      </button>
                    </div>

                    <div className="control-group">
                      <label>Scale ({selectedLayer.scale ? selectedLayer.scale.x.toFixed(1) : 1}x)</label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        className="range-input"
                        value={selectedLayer.scale ? selectedLayer.scale.x : 1}
                        onChange={(e) =>
                          updateSelectedLayerTransform('scale', {
                            x: parseFloat(e.target.value),
                            y: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="control-group">
                      <label>Rotation ({selectedLayer.rotation || 0}°)</label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        className="range-input"
                        value={selectedLayer.rotation || 0}
                        onChange={(e) =>
                          updateSelectedLayerTransform('rotation', parseInt(e.target.value, 10))
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="empty-tools-state">
                    <p>Select an image to add it as a layer. Click an existing image layer on the canvas to adjust scale and rotation.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="studio-panel-section">
            <h3>Layers ({layers.length})</h3>
            {layers.length === 0 ? (
              <p className="section-subtitle">No design layers created yet.</p>
            ) : (
              <div>
                {selectedLayer && (
                  <div className="layer-order-controls">
                    <button
                      className="order-btn"
                      onClick={() => moveLayerOrder('front')}
                      title="Bring to Front"
                    >
                      ⇈ Front
                    </button>
                    <button
                      className="order-btn"
                      onClick={() => moveLayerOrder('forward')}
                      title="Bring Forward"
                    >
                      ↑ Forward
                    </button>
                    <button
                      className="order-btn"
                      onClick={() => moveLayerOrder('backward')}
                      title="Send Backward"
                    >
                      ↓ Backward
                    </button>
                    <button
                      className="order-btn"
                      onClick={() => moveLayerOrder('back')}
                      title="Send to Back"
                    >
                      ⇊ Back
                    </button>
                  </div>
                )}

                <div className="layers-list">
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      className={`layer-item-row ${layer.id === selectedLayerId ? 'active' : ''}`}
                      onClick={() => setSelectedLayerId(layer.id)}
                    >
                      <div className="layer-item-info">
                        <span className="layer-type-badge">
                          {layer.type === 'text'
                            ? 'Text'
                            : layer.type === 'predefined_design'
                            ? 'Design'
                            : 'Image'}
                        </span>
                        <span className="layer-item-title">
                          {layer.type === 'text'
                            ? layer.text.content || 'Text Layer'
                            : layer.type === 'predefined_design'
                            ? layer.design.name || 'Design Layer'
                            : layer.image.name || 'Uploaded Image'}
                        </span>
                      </div>
                      <button
                        className="layer-item-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLayer(layer.id);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="studio-panel-section">
            <h3>Configuration</h3>

            <div className="control-group">
              <label>Select Colour</label>
              <div className="colour-picker-grid">
                {availableColours.map((col) => {
                  const hex = colourMap[col] || '#cccccc';
                  const isSelected = selectedColour === col;
                  return (
                    <button
                      key={col}
                      className={`colour-swatch ${isSelected ? 'active' : ''}`}
                      style={{ backgroundColor: hex }}
                      title={col}
                      onClick={() => setSelectedColour(col)}
                    />
                  );
                })}
              </div>
            </div>

            <div className="control-group">
              <label>Select Size</label>
              <div className="size-picker-grid">
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    className={`size-btn ${selectedSize === sz ? 'active' : ''}`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Studio;
