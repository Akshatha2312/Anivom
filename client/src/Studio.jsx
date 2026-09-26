import React, { useState, useRef, useEffect } from 'react';
import './Studio.css';
import { API_BASE_URL } from './config';
import { PREDEFINED_DESIGNS } from './designsData';
import AuthModal from './AuthModal';
import StudioOnboardingModal from './StudioOnboardingModal';

let cachedStudioDesigns = null;

const Studio = ({ product, user, initialCustomization, onBack, onCartUpdated, onNavigateToCart, onAuthSuccess }) => {
  const [selectedStudioProduct, setSelectedStudioProduct] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  const [activeView, setActiveView] = useState('front');
  const [viewUnavailableModal, setViewUnavailableModal] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState('garment');

  const activeProduct = product || selectedStudioProduct;

  const availableSizes = activeProduct && activeProduct.variants && activeProduct.variants.length > 0
    ? Array.from(new Set(activeProduct.variants.map((v) => v.size)))
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const availableColours = activeProduct && activeProduct.variants && activeProduct.variants.length > 0
    ? Array.from(new Set(activeProduct.variants.map((v) => v.colour)))
    : (activeProduct && activeProduct.colours && activeProduct.colours.length > 0 ? activeProduct.colours : []);


  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColour, setSelectedColour] = useState('Black');

  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [customizationId, setCustomizationId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [libraryDesigns, setLibraryDesigns] = useState(cachedStudioDesigns || PREDEFINED_DESIGNS);

  const printAreaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem('anivom_has_seen_studio_onboarding');
      if (!hasSeen) {
        setShowOnboardingModal(true);
      }
    } catch {
      setShowOnboardingModal(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
    try {
      localStorage.setItem('anivom_has_seen_studio_onboarding', 'true');
    } catch {
    }
    setShowOnboardingModal(false);
  };

  useEffect(() => {
    if (cachedStudioDesigns) return;
    let isMounted = true;
    fetch(`${API_BASE_URL}/api/v1/designs`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch designs');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.data?.designs && data.data.designs.length > 0) {
          const formatted = data.data.designs.map((d) => ({
            id: d._id || d.id,
            name: d.name,
            category: d.category,
            svg: d.svg,
            url: d.url,
          }));
          cachedStudioDesigns = formatted;
          setLibraryDesigns(formatted);
        }
      })
      .catch(() => {
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeProduct && activeProduct.variants && activeProduct.variants.length > 0) {
      const sizes = Array.from(new Set(activeProduct.variants.map((v) => v.size)));
      const colours = Array.from(new Set(activeProduct.variants.map((v) => v.colour)));
      if (sizes.length > 0 && (!initialCustomization || !initialCustomization.size)) {
        setSelectedSize(sizes[0]);
      }
      if (colours.length > 0 && (!initialCustomization || !initialCustomization.colour)) {
        setSelectedColour(colours[0]);
      }
    }
  }, [activeProduct, initialCustomization]);

  useEffect(() => {
    if (activeProduct) return;
    let isMounted = true;
    setLoadingProducts(true);
    setProductsError(null);
    fetch(`${API_BASE_URL}/api/v1/products`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setProductsList(data.data?.products || []);
          setLoadingProducts(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProductsError('Error connecting to ANIVOM products API.');
          setLoadingProducts(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [activeProduct]);

  useEffect(() => {
    if (initialCustomization) {
      if (initialCustomization.size) setSelectedSize(initialCustomization.size);
      if (initialCustomization.colour) setSelectedColour(initialCustomization.colour);
      if (initialCustomization._id) setCustomizationId(initialCustomization._id);

      if (initialCustomization.layers) {
        const restoredLayers = initialCustomization.layers.map((l, index) => {
          const layerId = l._id ? l._id.toString() : l.id || `layer_${Date.now()}_${index}`;

          if (l.type === 'predefined_design' && l.design) {
            const matchedDesign = libraryDesigns.find(
              (d) => d.id === l.design.designId || d._id === l.design.designId
            );
            return {
              ...l,
              id: layerId,
              view: l.view || 'front',
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
              view: l.view || 'front',
              image: {
                ...l.image,
                name: l.image.name || 'Uploaded Image',
              },
            };
          }

          return {
            ...l,
            id: layerId,
            view: l.view || 'front',
          };
        });

        setLayers(restoredLayers);
      }
    }
  }, [initialCustomization, libraryDesigns]);

  const getStudioGarmentFrontImage = (prod) => {
    if (!prod) return null;
    if (prod.garmentImages?.front) return prod.garmentImages.front;
    if (prod.garmentImages?.byColour) {
      const byCol = prod.garmentImages.byColour;
      const colMapObj = byCol instanceof Map ? Object.fromEntries(byCol) : byCol;
      const firstCol = Object.keys(colMapObj || {})[0];
      if (firstCol && colMapObj[firstCol]?.front) {
        return colMapObj[firstCol].front;
      }
    }
    return prod.images && prod.images.length > 0 ? prod.images[0] : null;
  };

  const DEFAULT_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='100%' height='100%' fill='%23F7F2E8'/><text x='50%' y='48%' font-family='serif' font-size='28' fill='%237A1F3D' text-anchor='middle' letter-spacing='4'>ANIVOM</text><text x='50%' y='53%' font-family='sans-serif' font-size='14' fill='%23C6A15B' text-anchor='middle' letter-spacing='2'>COUTURE</text></svg>";

  if (!activeProduct) {
    return (
      <div className="studio-root studio-selector-page">
        <header className="studio-header">
          <div className="studio-header-left">
            <button className="studio-back-btn" onClick={onBack}>
              &larr; Catalog
            </button>
            <div className="studio-brand-group">
              <span className="studio-badge">ANIVOM STUDIO ATELIER</span>
              <span className="studio-tagline">Make it yours. Choose a piece and start creating.</span>
            </div>
            <button
              className="studio-back-btn"
              onClick={() => setShowOnboardingModal(true)}
              style={{ marginLeft: '12px' }}
            >
              HOW IT WORKS
            </button>
          </div>
        </header>

        <div className="studio-selector-hero">
          <div className="studio-selector-badge">BESPOKE STUDIO ATELIER</div>
          <h1 className="studio-selector-title">ANIVOM STUDIO</h1>
          <p className="studio-selector-subtitle">Make it yours. Choose a piece and start creating.</p>
        </div>

        <div className="studio-selector-container">
          {loadingProducts ? (
            <div className="studio-selector-loading">
              <div className="studio-spinner"></div>
              <p>Loading ANIVOM Studio Collection...</p>
            </div>
          ) : productsError ? (
            <div className="studio-selector-error">
              <p>{productsError}</p>
              <button
                className="studio-back-btn"
                onClick={() => {
                  setLoadingProducts(true);
                  setProductsError(null);
                  fetch(`${API_BASE_URL}/api/v1/products`)
                    .then((res) => res.json())
                    .then((data) => {
                      setProductsList(data.data?.products || []);
                      setLoadingProducts(false);
                    })
                    .catch(() => {
                      setProductsError('Error loading products');
                      setLoadingProducts(false);
                    });
                }}
              >
                Retry Loading
              </button>
            </div>
          ) : productsList.length === 0 ? (
            <div className="studio-selector-empty">
              <p>No customizable products are currently available in the studio.</p>
              <button className="studio-back-btn" onClick={onBack}>
                Return to Catalog
              </button>
            </div>
          ) : (
            <div className="studio-selector-grid">
              {productsList.map((prod) => {
                const img = getStudioGarmentFrontImage(prod);
                const sizes = prod.variants ? Array.from(new Set(prod.variants.map((v) => v.size))) : [];
                const colors = prod.variants ? Array.from(new Set(prod.variants.map((v) => v.colour))) : [];

                return (
                  <div key={prod._id} className="studio-product-card" onClick={() => setSelectedStudioProduct(prod)}>
                    <div className="studio-product-img-wrapper">
                      {img ? (
                        <img
                          src={img}
                          alt={prod.name}
                          className="studio-product-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_PLACEHOLDER;
                          }}
                        />
                      ) : (
                        <div className="studio-product-no-img">ANIVOM BASE GARMENT</div>
                      )}
                      <span className="studio-product-category-tag">{prod.category || 'STUDIO ESSENTIAL'}</span>
                    </div>

                    <div className="studio-product-card-body">
                      <div className="studio-product-card-header">
                        <h3 className="studio-product-card-name">{prod.name}</h3>
                        <span className="studio-product-card-price">&#8377;{prod.basePrice}</span>
                      </div>

                      {sizes.length > 0 && (
                        <div className="studio-product-tags">
                          <span className="studio-tag-label">SIZES:</span>
                          {sizes.slice(0, 6).map((sz) => (
                            <span key={sz} className="studio-pill">{sz}</span>
                          ))}
                        </div>
                      )}

                      {colors.length > 0 && (
                        <div className="studio-product-tags">
                          <span className="studio-tag-label">COLOURS:</span>
                          {colors.slice(0, 5).map((c) => (
                            <span key={c} className="studio-pill studio-pill-color">{c}</span>
                          ))}
                        </div>
                      )}

                      <button
                        className="studio-customize-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudioProduct(prod);
                        }}
                      >
                        START DESIGNING
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {showOnboardingModal && (
          <StudioOnboardingModal onClose={handleCloseOnboarding} />
        )}
      </div>
    );
  }

  const getGarmentViewImage = (view) => {
    if (selectedColour && activeProduct?.garmentImages?.byColour) {
      const byColourObj = activeProduct.garmentImages.byColour;
      const colourMapObj = byColourObj instanceof Map ? Object.fromEntries(byColourObj) : byColourObj;
      const colourData = colourMapObj?.[selectedColour];
      if (colourData && colourData[view]) {
        return colourData[view];
      }
    }
    return activeProduct?.garmentImages?.[view] || null;
  };

  const isGarmentViewAvailable = (viewKey) => {
    if (viewKey === 'front' || viewKey === 'back') return true;
    return !!getGarmentViewImage(viewKey);
  };

  const hasColourGarmentImages = !!(selectedColour && activeProduct?.garmentImages?.byColour);

  const frontImage =
    getGarmentViewImage('front') ||
    getStudioGarmentFrontImage(activeProduct);

  const backImage =
    getGarmentViewImage('back') ||
    (activeProduct?.images && activeProduct.images.length > 1 ? activeProduct.images[1] : frontImage);

  const leftImage = getGarmentViewImage('left');
  const rightImage = getGarmentViewImage('right');

  let currentGarmentImage = frontImage;
  if (activeView === 'back') {
    currentGarmentImage = backImage;
  } else if (activeView === 'left') {
    currentGarmentImage = leftImage;
  } else if (activeView === 'right') {
    currentGarmentImage = rightImage;
  }

  const colourMap = {
    Black: '#18181b',
    White: '#f8fafc',
    Red: '#dc2626',
    Blue: '#2563eb',
    Green: '#16a34a',
    Yellow: '#eab308',
    Orange: '#ea580c',
    Pink: '#ec4899',
    Purple: '#9333ea',
    Maroon: '#7A1F3D',
    Navy: '#1e3a8a',
    'Navy Blue': '#1e3a8a',
    Grey: '#64748b',
    Brown: '#78350f',
    Beige: '#f5f5dc',
    Cream: '#fffdd0',
    Olive: '#65a30d',
    'Olive Green': '#65a30d',
    Teal: '#0d9488',
    Mustard: '#d97706',
    Wine: '#701a75',
    'Sky Blue': '#0284c7',
    'Soft Pink': '#f472b6',
  };

  const garmentColor = colourMap[selectedColour] || '#18181b';

  const activeViewLayers = layers.filter((l) => (l.view || 'front') === activeView);
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  const handleAddTextLayer = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const newLayer = {
      id: `text_${timestamp}_${randomSuffix}`,
      type: 'text',
      view: activeView,
      order: layers.length + 1,
      position: { x: 120, y: 120 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      text: {
        content: 'ANIVOM STUDIO',
        fontFamily: 'Playfair Display',
        fontSize: 22,
        color: '#FFFDF8',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
      },
    };

    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    setActiveToolTab('text');
  };

  const handleAddDesignLayer = (designObj) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const newLayer = {
      id: `design_${timestamp}_${randomSuffix}`,
      type: 'predefined_design',
      view: activeView,
      order: layers.length + 1,
      position: { x: 120, y: 120 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      design: {
        designId: designObj.id,
        name: designObj.name,
        svg: designObj.svg,
        color: '#FFFDF8',
      },
    };

    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    setActiveToolTab('artwork');
  };

  const handleImageFileSelect = async (e) => {
    setUploadError(null);
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!user) {
      setShowAuthModal(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid format. Please upload PNG, JPG, JPEG, or WEBP.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setUploadError('File size exceeds 5 MB. Please select a smaller image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE_URL}/api/v1/uploads/image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Image upload failed.');
      }

      const imageUrl = data.data?.url;
      const publicId = data.data?.publicId;

      if (!imageUrl) {
        throw new Error('No Cloudinary image URL returned from server.');
      }

      const timestamp = Date.now().toString(36);
      const randomSuffix = Math.random().toString(36).substring(2, 6);

      const newLayer = {
        id: `image_${timestamp}_${randomSuffix}`,
        type: 'uploaded_image',
        view: activeView,
        order: layers.length + 1,
        position: { x: 120, y: 120 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        image: {
          url: imageUrl,
          publicId: publicId || null,
          name: file.name,
        },
      };

      setLayers((prev) => [...prev, newLayer]);
      setSelectedLayerId(newLayer.id);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload custom image.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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

  const handlePointerDown = (e, layer) => {
    e.stopPropagation();
    setSelectedLayerId(layer.id);
    if (layer.type === 'text') {
      setActiveToolTab('text');
    } else if (layer.type === 'predefined_design') {
      setActiveToolTab('artwork');
    } else if (layer.type === 'uploaded_image') {
      setActiveToolTab('upload');
    }

    if (!printAreaRef.current) return;

    const bounds = printAreaRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPos = { ...layer.position };

    const handlePointerMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newX = initialPos.x + deltaX;
      let newY = initialPos.y + deltaY;

      newX = Math.max(15, Math.min(bounds.width - 15, newX));
      newY = Math.max(15, Math.min(bounds.height - 15, newY));

      setLayers((prevLayers) =>
        prevLayers.map((l) => {
          if (l.id === layer.id) {
            return {
              ...l,
              position: { x: newX, y: newY },
            };
          }
          return l;
        })
      );
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const saveCustomizationInternal = async () => {
    if (!user) {
      throw new Error('You must be logged in to save a customization.');
    }

    if (!activeProduct || !activeProduct._id) {
      throw new Error('No product selected.');
    }

    if (!selectedSize) {
      throw new Error('Please select a size.');
    }

    if (!selectedColour) {
      throw new Error('Please select a colour.');
    }

    const payload = {
      product: activeProduct._id,
      size: selectedSize,
      colour: selectedColour,
      layers,
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

    if (!user) {
      setShowAuthModal(true);
      return;
    }

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
      setShowAuthModal(true);
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

      const hasExactColourVariant = activeProduct?.variants?.some((v) => v.colour === selectedColour);
      const fallbackColour = activeProduct?.variants?.[0]?.colour || selectedColour;
      const colourToSubmit = hasExactColourVariant ? selectedColour : fallbackColour;

      const res = await fetch(`${API_BASE_URL}/api/v1/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          product: activeProduct._id,
          size: selectedSize,
          colour: colourToSubmit,
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
        onNavigateToCart();
      }
    } catch (err) {
      setSaveError(err.message || 'Error adding customized product to cart.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isPreviewMode) {
    return (
      <div className="studio-root studio-preview-fullscreen">
        <header className="studio-header">
          <div className="studio-header-left">
            <button className="studio-back-btn" onClick={() => setIsPreviewMode(false)}>
              &larr; Return to Studio Editor
            </button>
            <div className="studio-brand-group">
              <span className="studio-badge">ANIVOM STUDIO PREVIEW MODE</span>
              <span className="studio-tagline">Inspect your bespoke garment design before purchasing.</span>
            </div>
          </div>
          <div className="studio-header-actions">
            <button
              className="save-customization-btn"
              onClick={handleSaveCustomization}
              disabled={isSaving || isAddingToCart}
            >
              {isSaving ? 'Saving...' : 'Save Creation'}
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

        <div className="studio-preview-mode-body">
          <div className="preview-canvas-stage">
            <div className="preview-view-switcher">
              <button
                className={`view-switch-btn ${activeView === 'front' ? 'active' : ''}`}
                onClick={() => setActiveView('front')}
              >
                FRONT VIEW
              </button>
              <button
                className={`view-switch-btn ${activeView === 'back' ? 'active' : ''}`}
                onClick={() => setActiveView('back')}
              >
                BACK VIEW
              </button>
              <button
                className={`view-switch-btn ${activeView === 'left' ? 'active' : ''}`}
                onClick={() => {
                  if (!isGarmentViewAvailable('left')) {
                    setViewUnavailableModal('LEFT');
                  } else {
                    setActiveView('left');
                  }
                }}
              >
                LEFT VIEW
              </button>
              <button
                className={`view-switch-btn ${activeView === 'right' ? 'active' : ''}`}
                onClick={() => {
                  if (!isGarmentViewAvailable('right')) {
                    setViewUnavailableModal('RIGHT');
                  } else {
                    setActiveView('right');
                  }
                }}
              >
                RIGHT VIEW
              </button>
            </div>

            <div className="garment-base garment-base-large" style={hasColourGarmentImages ? {} : { backgroundColor: garmentColor }}>
              {currentGarmentImage ? (
                <img
                  src={currentGarmentImage}
                  alt={activeProduct.name}
                  className="product-image-overlay"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_PLACEHOLDER;
                  }}
                />
              ) : (
                <div className="tshirt-silhouette-fallback">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className="silhouette-svg">
                    <path d="M 30 15 Q 50 25 70 15 L 85 30 L 75 40 L 70 35 L 70 85 L 30 85 L 30 35 L 25 40 L 15 30 Z" />
                  </svg>
                </div>
              )}

              <div className="design-print-area preview-clean-print-area">
                {activeViewLayers.map((layer) => {
                  const scaleVal = layer.scale ? layer.scale.x : 1;
                  const rotVal = layer.rotation || 0;

                  return (
                    <div
                      key={layer.id}
                      className="canvas-text-layer"
                      style={{
                        left: `${layer.position.x}px`,
                        top: `${layer.position.y}px`,
                        transform: `translate(-50%, -50%) rotate(${rotVal}deg) scale(${scaleVal})`,
                        zIndex: layer.order,
                      }}
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
                          style={{ color: layer.design.color || '#FFFDF8' }}
                          dangerouslySetInnerHTML={{ __html: layer.design.svg }}
                        />
                      )}

                      {layer.type === 'uploaded_image' && (
                        <div className="image-layer-container">
                          <img src={layer.image.url} alt="Uploaded artwork" className="uploaded-canvas-img" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="preview-details-sidebar">
            <h2 className="preview-product-title">{activeProduct.name}</h2>
            <div className="preview-price-tag">&#8377;{activeProduct.basePrice}</div>

            <div className="preview-spec-group">
              <label>SELECTED COLOUR</label>
              <div className="spec-val-row">
                <span className="spec-color-dot" style={{ backgroundColor: garmentColor }}></span>
                <span>{selectedColour}</span>
              </div>
            </div>

            <div className="preview-spec-group">
              <label>SELECTED SIZE</label>
              <div className="spec-val-badge">{selectedSize}</div>
            </div>

            <div className="preview-spec-group">
              <label>CUSTOMIZATION SUMMARY</label>
              <div className="spec-layers-summary">
                <div>Front View: <strong>{layers.filter((l) => (l.view || 'front') === 'front').length} layers</strong></div>
                <div>Back View: <strong>{layers.filter((l) => l.view === 'back').length} layers</strong></div>
                <div>Left View: <strong>{layers.filter((l) => l.view === 'left').length} layers</strong></div>
                <div>Right View: <strong>{layers.filter((l) => l.view === 'right').length} layers</strong></div>
              </div>
            </div>

            <div className="preview-actions-stack">
              <button
                className="add-to-cart-btn full-width"
                onClick={handleAddToCartCustomized}
                disabled={isSaving || isAddingToCart}
              >
                {isAddingToCart ? 'Adding...' : 'Add Design to Bag'}
              </button>
              <button className="studio-back-btn full-width" onClick={() => setIsPreviewMode(false)}>
                Return to Editor
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="studio-product-name">{activeProduct.name}</h1>
          <span className="studio-price">&#8377;{activeProduct.basePrice}</span>
        </div>

        <div className="studio-header-actions">
          <button className="studio-back-btn" onClick={() => setShowOnboardingModal(true)}>
            HOW IT WORKS
          </button>
          <button className="studio-back-btn" onClick={() => setIsPreviewMode(true)}>
            PREVIEW
          </button>
          <button
            className="save-customization-btn"
            onClick={handleSaveCustomization}
            disabled={isSaving || isAddingToCart}
          >
            {isSaving ? 'Saving...' : customizationId ? 'Save Changes' : 'Save Creation'}
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

      <div className="studio-app-workspace">
        <nav className="studio-tool-bar" aria-label="Studio Tools">
          <button
            className={`tool-bar-btn ${activeToolTab === 'garment' ? 'active' : ''}`}
            onClick={() => setActiveToolTab('garment')}
          >
            <span className="tool-icon">G</span>
            <span className="tool-label">Garment</span>
          </button>
          <button
            className={`tool-bar-btn ${activeToolTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveToolTab('text')}
          >
            <span className="tool-icon">T</span>
            <span className="tool-label">Text</span>
          </button>
          <button
            className={`tool-bar-btn ${activeToolTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveToolTab('upload')}
          >
            <span className="tool-icon">U</span>
            <span className="tool-label">Upload</span>
          </button>
          <button
            className={`tool-bar-btn ${activeToolTab === 'artwork' ? 'active' : ''}`}
            onClick={() => setActiveToolTab('artwork')}
          >
            <span className="tool-icon">A</span>
            <span className="tool-label">Artwork</span>
          </button>
          <button
            className={`tool-bar-btn ${activeToolTab === 'layers' ? 'active' : ''}`}
            onClick={() => setActiveToolTab('layers')}
          >
            <span className="tool-icon">≡</span>
            <span className="tool-label">Layers ({layers.length})</span>
          </button>
          <button className="tool-bar-btn" onClick={() => setIsPreviewMode(true)}>
            <span className="tool-icon">👁</span>
            <span className="tool-label">Preview</span>
          </button>
        </nav>

        <div className="studio-context-drawer">
          {activeToolTab === 'garment' && (
            <div className="drawer-content">
              <div className="panel-section-header">
                <h3>Garment Configuration</h3>
              </div>
              <div className="garment-card-summary">
                <span className="garment-summary-title">{activeProduct.name}</span>
                <span className="garment-summary-price">&#8377;{activeProduct.basePrice}</span>
              </div>

              <div className="control-group">
                <label>Colour Variant</label>
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
                <label>Available Size</label>
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

              <div className="control-group" style={{ marginTop: '20px' }}>
                <label className="panel-sublabel">PRODUCTS</label>
                <div className="studio-product-picker-grid">
                  {productsList.map((prod) => {
                    const isSelected = activeProduct && (activeProduct._id === prod._id || activeProduct.id === prod.id)
                    const thumbImg = getStudioGarmentFrontImage(prod);
                    return (
                      <button
                        key={prod._id || prod.id}
                        className={`studio-product-select-card ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedStudioProduct(prod)}
                      >
                        {thumbImg ? (
                          <img
                            src={thumbImg}
                            alt={prod.name}
                            className="studio-select-thumb"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = DEFAULT_PLACEHOLDER;
                            }}
                          />
                        ) : (
                          <div className="studio-select-no-img">ANIVOM</div>
                        )}
                        <div className="studio-select-info">
                          <span className="studio-select-name">{prod.name}</span>
                          <span className="studio-select-price">&#8377;{prod.basePrice}</span>
                        </div>
                        {isSelected && <span className="studio-select-badge">ACTIVE</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeToolTab === 'text' && (
            <div className="drawer-content">
              <div className="panel-section-header">
                <h3>Typography & Text</h3>
                <button className="add-text-btn" onClick={handleAddTextLayer}>
                  + Add Text Layer
                </button>
              </div>

              {selectedLayer && selectedLayer.type === 'text' ? (
                <div className="text-editor-controls">
                  <div className="editor-title-bar">
                    <span className="editor-title">Edit Text Layer ({(selectedLayer.view || 'front').toUpperCase()})</span>
                    <button
                      className="delete-layer-btn"
                      onClick={() => handleDeleteLayer(selectedLayer.id)}
                    >
                      Delete ✕
                    </button>
                  </div>

                  <div className="control-group">
                    <label>Text Content</label>
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
                        <option value="Playfair Display">Playfair Display</option>
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
                  <p>Click <strong>+ Add Text Layer</strong> to create text on the {activeView.toUpperCase()} view of your garment.</p>
                </div>
              )}
            </div>
          )}

          {activeToolTab === 'upload' && (
            <div className="drawer-content">
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
                  disabled={isUploadingImage}
                  onClick={() => {
                    if (!user) {
                      setShowAuthModal(true);
                      return;
                    }
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                >
                  {isUploadingImage ? 'Uploading Image to Cloudinary...' : 'Select Image File'}
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
                  <p>Upload a custom image to place it on the active {activeView.toUpperCase()} view.</p>
                </div>
              )}
            </div>
          )}

          {activeToolTab === 'artwork' && (
            <div className="drawer-content">
              <div className="panel-section-header">
                <h3>ANIVOM Artwork Collections</h3>
              </div>

              <div className="designs-grid">
                {libraryDesigns.map((d) => (
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
                    <span className="editor-title">Edit Artwork Layer</span>
                    <button
                      className="delete-layer-btn"
                      onClick={() => handleDeleteLayer(selectedLayer.id)}
                    >
                      Delete ✕
                    </button>
                  </div>

                  <div className="control-group">
                    <label>Color</label>
                    <input
                      type="color"
                      className="color-input"
                      value={selectedLayer.design.color || '#FFFDF8'}
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

          {activeToolTab === 'layers' && (
            <div className="drawer-content">
              <div className="panel-section-header">
                <h3>Design Layers Stack ({layers.length})</h3>
              </div>

              {layers.length === 0 ? (
                <p className="section-subtitle">No design layers created yet.</p>
              ) : (
                <div>
                  {selectedLayer && (
                    <div className="layer-order-controls">
                      <button className="order-btn" onClick={() => moveLayerOrder('front')}>⇈ Front</button>
                      <button className="order-btn" onClick={() => moveLayerOrder('forward')}>↑ Forward</button>
                      <button className="order-btn" onClick={() => moveLayerOrder('backward')}>↓ Backward</button>
                      <button className="order-btn" onClick={() => moveLayerOrder('back')}>⇊ Back</button>
                    </div>
                  )}

                  <div className="layers-list">
                    {layers.map((layer) => (
                      <div
                        key={layer.id}
                        className={`layer-item-row ${layer.id === selectedLayerId ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedLayerId(layer.id);
                          if (layer.view) setActiveView(layer.view);
                        }}
                      >
                        <div className="layer-item-info">
                          <span className="layer-view-tag">{(layer.view || 'front').toUpperCase()}</span>
                          <span className="layer-type-badge">
                            {layer.type === 'text'
                              ? 'Text'
                              : layer.type === 'predefined_design'
                                ? 'Artwork'
                                : 'Image'}
                          </span>
                          <span className="layer-item-title">
                            {layer.type === 'text'
                              ? layer.text.content || 'Text Layer'
                              : layer.type === 'predefined_design'
                                ? layer.design.name || 'Artwork'
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
          )}
        </div>

        <main className="studio-canvas-stage">
          <div className="stage-top-controls">
            <div className="view-switcher-group">
              <button
                className={`stage-view-btn ${activeView === 'front' ? 'active' : ''}`}
                onClick={() => setActiveView('front')}
              >
                FRONT
              </button>
              <button
                className={`stage-view-btn ${activeView === 'back' ? 'active' : ''}`}
                onClick={() => setActiveView('back')}
              >
                BACK
              </button>
              <button
                className={`stage-view-btn ${activeView === 'left' ? 'active' : ''}`}
                onClick={() => {
                  if (!isGarmentViewAvailable('left')) {
                    setViewUnavailableModal('LEFT');
                  } else {
                    setActiveView('left');
                  }
                }}
              >
                LEFT
              </button>
              <button
                className={`stage-view-btn ${activeView === 'right' ? 'active' : ''}`}
                onClick={() => {
                  if (!isGarmentViewAvailable('right')) {
                    setViewUnavailableModal('RIGHT');
                  } else {
                    setActiveView('right');
                  }
                }}
              >
                RIGHT
              </button>
            </div>
            <span className="stage-active-badge">Editing {activeView.toUpperCase()} View</span>
          </div>

          <div className="studio-preview-section">
            <div className="studio-canvas-container">
              <div className="garment-base">
                {currentGarmentImage ? (
                  <img
                    src={currentGarmentImage}
                    alt={activeProduct.name}
                    className="product-image-overlay"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_PLACEHOLDER;
                    }}
                  />
                ) : (
                  <div className="tshirt-silhouette-fallback">
                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className="silhouette-svg">
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
                    {activeViewLayers.length === 0 && (
                      <span className="print-area-label">Print Area ({activeView.toUpperCase()})</span>
                    )}
                  </div>

                  {activeViewLayers.map((layer) => {
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
                        onClick={(e) => e.stopPropagation()}
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
                            style={{ color: layer.design.color || '#FFFDF8' }}
                            dangerouslySetInnerHTML={{ __html: layer.design.svg }}
                          />
                        )}

                        {layer.type === 'uploaded_image' && (
                          <div className="image-layer-container">
                            <img src={layer.image.url} alt="Uploaded artwork" className="uploaded-canvas-img" />
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
        </main>
      </div>

      {showAuthModal && (
        <AuthModal
          user={user}
          mode="login"
          isOverlay={true}
          onClose={() => setShowAuthModal(false)}
          onNavigateToCatalog={() => setShowAuthModal(false)}
          onAuthSuccess={(userData) => {
            setShowAuthModal(false);
            if (onAuthSuccess) onAuthSuccess(userData);
          }}
        />
      )}

      {showOnboardingModal && (
        <StudioOnboardingModal onClose={handleCloseOnboarding} />
      )}

      {viewUnavailableModal && (
        <div className="studio-view-unavailable-overlay" onClick={() => setViewUnavailableModal(null)}>
          <div className="studio-view-unavailable-card" onClick={(e) => e.stopPropagation()}>
            <button className="studio-modal-close-btn" onClick={() => setViewUnavailableModal(null)}>
              &times;
            </button>
            <div className="studio-view-unavailable-badge">VIEW NOTICE</div>
            <h3 className="studio-view-unavailable-title">{viewUnavailableModal} VIEW UNAVAILABLE</h3>
            <p className="studio-view-unavailable-text">
              This garment currently has Front and Back views only.
            </p>
            <button className="studio-view-unavailable-btn" onClick={() => setViewUnavailableModal(null)}>
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Studio;

