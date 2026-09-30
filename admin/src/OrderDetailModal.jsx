import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import StatusBadge from './StatusBadge';

const FALLBACK_PREVIEW_CANVAS = { width: 420, height: 520 };
const CUSTOMIZATION_VIEWS = ['front', 'back', 'left', 'right'];
const garmentColourMap = {
  black: '#292929', white: '#F7F5EF', red: '#9B3434', blue: '#42617F',
  green: '#4E6A52', yellow: '#C5A947', orange: '#BB683A', pink: '#D39AAB',
  purple: '#71617D', maroon: '#7A1F3D', navy: '#34465F', 'navy blue': '#34465F',
  grey: '#858585', gray: '#858585', brown: '#705B4B', beige: '#D7CCB5',
  cream: '#EAE3D4', teal: '#4E7B78', mustard: '#B9983C', olive: '#73784B',
  'olive green': '#73784B', 'sky blue': '#82AFC2', wine: '#783D50', 'soft pink': '#D39AAB',
};

const getGarmentColour = (colour) => garmentColourMap[String(colour || '').toLowerCase()] || '#D8D5CE';

const getSnapshotCanvas = (snapshot) => {
  const width = Number(snapshot?.canvas?.width);
  const height = Number(snapshot?.canvas?.height);
  if (Number.isFinite(width) && width >= 1 && Number.isFinite(height) && height >= 1) {
    return { width, height };
  }
  return FALLBACK_PREVIEW_CANVAS;
};

const getPrintArea = (canvas) => ({
  x: canvas.width * 0.26,
  y: canvas.height * 0.24,
  width: canvas.width * 0.48,
  height: canvas.height * 0.52,
});

const getLayerScale = (scale) => {
  const value = typeof scale === 'number' ? scale : Number(scale?.x ?? 1);
  return Number.isFinite(value) ? value : 1;
};

const isUploadedImageLayer = (layer) => layer.type === 'uploaded_image' || layer.type === 'image';

const formatLayerValue = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : 'N/A';
};

const CustomizationLayerPreview = ({ layer, printArea }) => {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const positionX = Number(layer.position?.x ?? 0);
  const positionY = Number(layer.position?.y ?? 0);
  const rotation = Number(layer.rotation) || 0;
  const scale = getLayerScale(layer.scale);
  const layerStyle = {
    position: 'absolute',
    left: `${Number.isFinite(positionX) ? positionX : 0}px`,
    top: `${Number.isFinite(positionY) ? positionY : 0}px`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
    transformOrigin: '50% 50%',
    zIndex: Number(layer.order) || 0,
  };
  const viewportStyle = {
    position: 'relative',
    width: `${printArea.width}px`,
    height: `${printArea.height}px`,
    overflow: 'visible',
  };
  const renderInPrintArea = (content, className) => (
    <foreignObject
      x={printArea.x}
      y={printArea.y}
      width={printArea.width}
      height={printArea.height}
      overflow="visible"
    >
      <div xmlns="http://www.w3.org/1999/xhtml" className="order-customization-layer-viewport" style={viewportStyle}>
        <div className={`order-customization-layer ${className}`} style={layerStyle}>
          {content}
        </div>
      </div>
    </foreignObject>
  );

  if (isUploadedImageLayer(layer)) {
    const imageUrl = layer.image?.url;
    const image = imageUrl && !imageUnavailable ? (
      <img
        src={imageUrl}
        alt="Customer uploaded artwork"
        className="order-customization-uploaded-image"
        onError={() => setImageUnavailable(true)}
      />
    ) : (
      <span className="order-customization-image-unavailable">Image unavailable</span>
    );
    return renderInPrintArea(image, 'order-customization-image-layer');
  }

  if (layer.type === 'text') {
    const text = layer.text || {};
    return renderInPrintArea(
      <span
        className="order-customization-text-layer"
        style={{
          fontFamily: text.fontFamily || 'Arial',
          fontSize: `${Number(text.fontSize) || 16}px`,
          color: text.color || '#000000',
          fontWeight: text.fontWeight || 'normal',
          fontStyle: text.fontStyle || 'normal',
          textAlign: text.textAlign || 'left',
          display: 'inline-block',
        }}
      >
        {text.content || ''}
      </span>,
      'order-customization-text-layer-wrap'
    );
  }

  if (layer.type === 'predefined_design') {
    const design = layer.design || {};
    const designUrl = design.svg
      ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(design.svg)}`
      : design.url;
    const artwork = designUrl && !imageUnavailable ? (
      <img
        src={designUrl}
        alt={design.name || design.designId || 'Predefined artwork'}
        className="order-customization-design-image"
        onError={() => setImageUnavailable(true)}
      />
    ) : (
      <span className="order-customization-artwork-reference">Artwork: {design.designId || 'unavailable'}</span>
    );
    return renderInPrintArea(artwork, 'order-customization-design-layer');
  }

  return null;
};

const CustomizationLayerDetails = ({ layer, index }) => {
  const layerOrder = Number(layer.order) || index + 1;
  const position = layer.position || {};
  const typeLabel = layer.type === 'text'
    ? 'Text'
    : isUploadedImageLayer(layer)
      ? 'Uploaded image'
      : layer.type === 'predefined_design'
        ? 'Predefined artwork'
        : 'Unknown layer';

  return (
    <article className="order-customization-layer-detail">
      <div className="order-customization-layer-detail-heading">
        <span className="layer-tag">LAYER {layerOrder}</span>
        <strong>{typeLabel}</strong>
        <span>{(layer.view || 'front').toUpperCase()}</span>
      </div>
      <dl>
        <div><dt>Position</dt><dd>X {formatLayerValue(position.x)} · Y {formatLayerValue(position.y)}</dd></div>
        <div><dt>Scale</dt><dd>Uniform {formatLayerValue(getLayerScale(layer.scale))}×</dd></div>
        <div><dt>Rotation</dt><dd>{formatLayerValue(layer.rotation ?? 0)}°</dd></div>
        {layer.type === 'text' && (
          <>
            <div className="order-customization-text-content"><dt>Text</dt><dd>{layer.text?.content || '—'}</dd></div>
            <div><dt>Font</dt><dd>{layer.text?.fontFamily || 'Arial'} · {layer.text?.fontSize ?? 16}px</dd></div>
            <div><dt>Style</dt><dd>{layer.text?.fontWeight || 'normal'} · {layer.text?.fontStyle || 'normal'} · {layer.text?.textAlign || 'left'}</dd></div>
            <div><dt>Colour</dt><dd><span className="order-customization-color-swatch" style={{ backgroundColor: layer.text?.color || '#000000' }} />{layer.text?.color || '#000000'}</dd></div>
          </>
        )}
        {layer.type === 'predefined_design' && (
          <div><dt>Artwork</dt><dd>{layer.design?.name || layer.design?.designId || 'No artwork reference'}</dd></div>
        )}
      </dl>
    </article>
  );
};

const UploadedArtworkCard = ({ layer, index }) => {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const imageUrl = layer.image?.url;
  const layerOrder = Number(layer.order) || index + 1;
  const position = layer.position || {};

  return (
    <article className="order-uploaded-artwork-card">
      <div className="order-uploaded-artwork-image">
        {imageUrl && !imageUnavailable ? (
          <img src={imageUrl} alt={`Uploaded artwork for layer ${layerOrder}`} onError={() => setImageUnavailable(true)} />
        ) : (
          <span>Image unavailable</span>
        )}
      </div>
      <div className="order-uploaded-artwork-info">
        <div className="order-uploaded-artwork-heading">
          <strong>LAYER {layerOrder}</strong>
          <span>{(layer.view || 'front').toUpperCase()}</span>
        </div>
        <dl>
          <div><dt>Position</dt><dd>X {formatLayerValue(position.x)} · Y {formatLayerValue(position.y)}</dd></div>
          <div><dt>Scale</dt><dd>{formatLayerValue(getLayerScale(layer.scale))}×</dd></div>
          <div><dt>Rotation</dt><dd>{formatLayerValue(layer.rotation ?? 0)}°</dd></div>
        </dl>
        {imageUrl && (
          <a className="order-uploaded-artwork-link" href={imageUrl} target="_blank" rel="noopener noreferrer">
            View Full Image
          </a>
        )}
      </div>
    </article>
  );
};

const CustomizationViewPreview = ({ item, view, layers, canvas, printArea }) => {
  const orderedLayers = [...layers].sort((first, second) => (Number(first.order) || 0) - (Number(second.order) || 0));
  const viewLabel = view.toUpperCase();

  return (
    <section className="order-customization-view-card" aria-label={`${viewLabel} customization preview`}>
      <header className="order-customization-view-header">
        <h5>{viewLabel} VIEW</h5>
        <span>{orderedLayers.length} {orderedLayers.length === 1 ? 'LAYER' : 'LAYERS'} · ORDERED FRONT TO BACK</span>
      </header>
      <div className="order-customization-canvas-wrap">
        <svg
          className="order-customization-canvas"
          viewBox={`0 0 ${canvas.width} ${canvas.height}`}
          role="img"
          aria-label={`${item.name || 'Garment'} ${viewLabel.toLowerCase()} production preview`}
        >
          <path
            d="M 30 15 Q 50 25 70 15 L 85 30 L 75 40 L 70 35 L 70 85 L 30 85 L 30 35 L 25 40 L 15 30 Z"
            transform={`translate(${(canvas.width - canvas.width * 0.65) / 2 + (canvas.width * 0.65 - Math.min(canvas.width * 0.65, canvas.height * 0.65)) / 2} ${(canvas.height - canvas.height * 0.65) / 2 + (canvas.height * 0.65 - Math.min(canvas.width * 0.65, canvas.height * 0.65)) / 2}) scale(${Math.min(canvas.width * 0.65, canvas.height * 0.65) / 100})`}
            fill={getGarmentColour(item.colour)}
            stroke="#77736D"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
          <rect
            x={printArea.x}
            y={printArea.y}
            width={printArea.width}
            height={printArea.height}
            fill="none"
            stroke="#7A1F3D"
            strokeOpacity="0.45"
            strokeDasharray="5 4"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          {orderedLayers.map((layer, index) => (
            <CustomizationLayerPreview key={layer._id || `${view}-${index}`} layer={layer} printArea={printArea} />
          ))}
        </svg>
      </div>
      <div className="order-customization-layer-details">
        {orderedLayers.map((layer, index) => (
          <CustomizationLayerDetails key={layer._id || `${view}-detail-${index}`} layer={layer} index={index} />
        ))}
      </div>
    </section>
  );
};

const OrderCustomizationPreview = ({ item, itemIndex }) => {
  const layers = Array.isArray(item.customizationSnapshot?.layers) ? item.customizationSnapshot.layers : null;
  const canvas = getSnapshotCanvas(item.customizationSnapshot);
  const printArea = getPrintArea(canvas);
  const views = layers
    ? CUSTOMIZATION_VIEWS.map((view) => ({ view, layers: layers.filter((layer) => (layer.view || 'front') === view) })).filter((entry) => entry.layers.length > 0)
    : [];
  const artworkViews = layers
    ? CUSTOMIZATION_VIEWS.map((view) => ({
      view,
      layers: layers.filter((layer) => (layer.view || 'front') === view && isUploadedImageLayer(layer) && layer.image?.url),
    })).filter((entry) => entry.layers.length > 0)
    : [];

  return (
    <section className="order-customization-preview" aria-label={`Production preview for ${item.name || `item ${itemIndex + 1}`}`}>
      <div className="order-customization-preview-heading">
        <div>
          <span className="custom-badge">PRODUCTION PREVIEW</span>
          <h4>{item.name || `Customized item ${itemIndex + 1}`}</h4>
        </div>
        <span>{item.size || '—'} · {item.colour || '—'}</span>
      </div>
      {!layers ? (
        <p className="order-customization-preview-empty">No customization layer snapshot is available for this item.</p>
      ) : views.length === 0 ? (
        <p className="order-customization-preview-empty">The saved customization has no layers to preview.</p>
      ) : (
        <div className="order-customization-view-grid">
          {views.map(({ view, layers: viewLayers }) => (
            <CustomizationViewPreview key={`${item._id || itemIndex}-${view}`} item={item} view={view} layers={viewLayers} canvas={canvas} printArea={printArea} />
          ))}
        </div>
      )}
      {artworkViews.length > 0 && (
        <section className="order-uploaded-artwork" aria-label="Uploaded artwork">
          <h5>UPLOADED ARTWORK</h5>
          {artworkViews.map(({ view, layers: viewLayers }) => (
            <div className="order-uploaded-artwork-group" key={`${item._id || itemIndex}-artwork-${view}`}>
              <h6>{view.toUpperCase()} ARTWORK</h6>
              <div className="order-uploaded-artwork-grid">
                {viewLayers.map((layer, index) => (
                  <UploadedArtworkCard key={layer._id || `${view}-artwork-${index}`} layer={layer} index={layers.indexOf(layer)} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </section>
  );
};

const OrderDetailModal = ({ orderId, onClose, onUpdated }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [activeAction, setActiveAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [adminNotes, setAdminNotes] = useState('');

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/admin/${orderId}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load order details.');
      }
      const ord = data.data?.order;
      setOrder(ord);

      const allowedTransitions = {
        PLACED: ['CONFIRMED', 'CANCELLED', 'FAILED'],
        CONFIRMED: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
        PROCESSING: ['SHIPPED', 'CANCELLED'],
        SHIPPED: ['DELIVERED', 'CANCELLED'],
      };

      const options = allowedTransitions[ord.orderStatus] || [];
      if (options.length > 0) {
        setSelectedNextStatus(options[0]);
      } else {
        setSelectedNextStatus('');
      }
    } catch (err) {
      setError(err.message || 'Error loading order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleUpdateStatus = async () => {
    if (!selectedNextStatus || updatingStatus) return;
    setUpdatingStatus(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderStatus: selectedNextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update order status.');
      }
      setActionSuccess(`Order status updated to ${selectedNextStatus}`);
      await fetchOrderDetails();
      if (onUpdated) onUpdated();
    } catch (err) {
      setActionError(err.message || 'Error updating order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleProcessReturn = async (decision) => {
    if (actionLoading) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/admin/${orderId}/return`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          decision,
          adminNotes: adminNotes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setActionSuccess(`Return request ${decision === 'RETURN_APPROVED' ? 'approved' : 'rejected'} successfully.`);
        setActiveAction(null);
        setAdminNotes('');
        await fetchOrderDetails();
        if (onUpdated) onUpdated();
      } else {
        setActionError(data.message || 'Failed to process return request.');
      }
    } catch (err) {
      setActionError('Network error while processing return request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessRefund = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/admin/${orderId}/refund`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setActionSuccess('Refund processed successfully via Razorpay.');
        setActiveAction(null);
        await fetchOrderDetails();
        if (onUpdated) onUpdated();
      } else {
        setActionError(data.message || 'Failed to process refund.');
      }
    } catch (err) {
      setActionError('Network error while processing refund.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!orderId) return null;

  const isEligibleForRefund =
    order &&
    order.paymentStatus === 'PAID' &&
    ['CANCELLED', 'RETURN_APPROVED'].includes(order.orderStatus) &&
    (!order.refundStatus || ['NONE', 'FAILED'].includes(order.refundStatus));

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content large-modal order-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h2>ORDER DOSSIER #{orderId.slice(-8).toUpperCase()}</h2>
            <span className="mono-text">ID: {orderId}</span>
          </div>
          <button className="admin-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="admin-state-container">
            <div className="admin-spinner"></div>
            <p>Loading Order Dossier...</p>
          </div>
        ) : error ? (
          <div className="admin-state-container">
            <p className="admin-error-text">{error}</p>
            <button className="admin-btn-secondary" onClick={fetchOrderDetails}>
              Retry Loading
            </button>
          </div>
        ) : !order ? null : (
          <div className="order-detail-stack">
            {actionError && <div className="admin-error-banner">{actionError}</div>}
            {actionSuccess && <div className="admin-success-banner">{actionSuccess}</div>}

            <div className="order-summary-top-grid">
              <div className="summary-block">
                <span className="summary-block-label">PAYMENT STATUS</span>
                <StatusBadge status={order.paymentStatus} type="payment" />
              </div>
              <div className="summary-block">
                <span className="summary-block-label">ORDER STATUS</span>
                <StatusBadge status={order.orderStatus} type="order" />
              </div>
              {order.refundStatus && order.refundStatus !== 'NONE' && (
                <div className="summary-block">
                  <span className="summary-block-label">REFUND STATUS</span>
                  <StatusBadge status={order.refundStatus} type="refund" />
                </div>
              )}
              <div className="summary-block">
                <span className="summary-block-label">SUBTOTAL</span>
                <span className="summary-block-val">&#8377;{order.subtotal}</span>
              </div>
              <div className="summary-block">
                <span className="summary-block-label">DISCOUNT</span>
                <span className="summary-block-val">&#8377;{order.discountAmount}</span>
              </div>
              <div className="summary-block">
                <span className="summary-block-label">TOTAL AMOUNT</span>
                <span className="summary-block-val">&#8377;{order.totalAmount}</span>
              </div>
              <div className="summary-block">
                <span className="summary-block-label">DATE PLACED</span>
                <span className="summary-block-val">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              {order.deliveredAt && (
                <div className="summary-block">
                  <span className="summary-block-label">DELIVERED AT</span>
                  <span className="summary-block-val">{new Date(order.deliveredAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="order-columns-grid">
              <div className="order-col-card">
                <h3>CUSTOMER INFORMATION</h3>
                <div className="info-key-val">
                  <span>Name:</span>
                  <strong>{order.user ? order.user.name : 'N/A'}</strong>
                </div>
                <div className="info-key-val">
                  <span>Email:</span>
                  <strong>{order.user ? order.user.email : 'N/A'}</strong>
                </div>
                <div className="info-key-val">
                  <span>Role:</span>
                  <span>{order.user ? order.user.role : 'N/A'}</span>
                </div>
              </div>

              <div className="order-col-card">
                <h3>SHIPPING ADDRESS SNAPSHOT</h3>
                {order.shippingAddress ? (
                  <div className="address-snapshot-box">
                    <strong>{order.shippingAddress.fullName}</strong> ({order.shippingAddress.phone})
                    <div>{order.shippingAddress.addressLine1}</div>
                    {order.shippingAddress.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
                    <div>
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                    </div>
                    <div>{order.shippingAddress.country}</div>
                  </div>
                ) : (
                  <p>No shipping address snapshot available.</p>
                )}
              </div>

              <div className="order-col-card">
                <h3>PAYMENT & REFUND GATEWAY</h3>
                <div className="info-key-val">
                  <span>Payment Status:</span>
                  <StatusBadge status={order.paymentStatus} type="payment" />
                </div>
                {order.refundStatus && order.refundStatus !== 'NONE' && (
                  <div className="info-key-val">
                    <span>Refund Status:</span>
                    <StatusBadge status={order.refundStatus} type="refund" />
                  </div>
                )}
                {order.refundedAmount !== undefined && order.refundedAmount > 0 && (
                  <div className="info-key-val">
                    <span>Refunded Amount:</span>
                    <strong>&#8377;{order.refundedAmount}</strong>
                  </div>
                )}
                {order.refundedAt && (
                  <div className="info-key-val">
                    <span>Refunded Date:</span>
                    <span>{new Date(order.refundedAt).toLocaleString()}</span>
                  </div>
                )}
                {order.razorpayRefundId && (
                  <div className="info-key-val">
                    <span>Razorpay Refund ID:</span>
                    <span className="mono-text">{order.razorpayRefundId}</span>
                  </div>
                )}
                <div className="info-key-val">
                  <span>Razorpay Order ID:</span>
                  <span className="mono-text">{order.razorpayOrderId || 'N/A'}</span>
                </div>
                <div className="info-key-val">
                  <span>Razorpay Payment ID:</span>
                  <span className="mono-text">{order.razorpayPaymentId || 'N/A'}</span>
                </div>

                {isEligibleForRefund && (
                  <div style={{ marginTop: '16px' }}>
                    <button
                      className="admin-submit-btn sm"
                      onClick={() => setActiveAction('refund')}
                    >
                      Process Refund (&#8377;{order.totalAmount})
                    </button>
                  </div>
                )}
              </div>
            </div>

            {order.orderStatus === 'CANCELLED' && (
              <div className="admin-variants-section" style={{ borderLeft: '4px solid #C65D3B' }}>
                <h3>ORDER CANCELLATION DETAILS</h3>
                <div className="info-key-val">
                  <span>Cancellation Reason:</span>
                  <strong>{order.cancellationReason || 'Cancelled by customer'}</strong>
                </div>
                <div className="info-key-val">
                  <span>Cancelled At:</span>
                  <span>{order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="info-key-val">
                  <span>Payment Status:</span>
                  <StatusBadge status={order.paymentStatus} type="payment" />
                </div>
                {order.refundStatus && order.refundStatus !== 'NONE' && (
                  <div className="info-key-val">
                    <span>Refund State:</span>
                    <StatusBadge status={order.refundStatus} type="refund" />
                  </div>
                )}
              </div>
            )}

            {order.orderStatus === 'RETURN_REQUESTED' && (
              <div className="admin-variants-section" style={{ borderLeft: '4px solid #7A1F3D' }}>
                <h3>RETURN REQUEST DOSSIER — ADMIN REVIEW</h3>
                <div className="info-key-val">
                  <span>Return Reason:</span>
                  <strong>{order.returnReason || 'Item return requested'}</strong>
                </div>
                {order.returnDetails && (
                  <div className="info-key-val">
                    <span>Return Details:</span>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                      {order.returnDetails}
                    </p>
                  </div>
                )}
                <div className="info-key-val">
                  <span>Garment Condition:</span>
                  <span className={order.isDefectiveOrDamaged ? 'stock-low-tag' : 'stock-ok-tag'}>
                    {order.isDefectiveOrDamaged ? '⚠️ Defective or Damaged Garment Reported' : 'Standard Garment Return'}
                  </span>
                </div>
                <div className="info-key-val">
                  <span>Requested Date:</span>
                  <span>{order.returnRequestedAt ? new Date(order.returnRequestedAt).toLocaleString() : 'N/A'}</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    className="admin-submit-btn sm"
                    onClick={() => setActiveAction('approve_return')}
                  >
                    Approve Return
                  </button>
                  <button
                    className="admin-btn-secondary sm"
                    style={{ color: '#C65D3B', borderColor: '#C65D3B' }}
                    onClick={() => {
                      setAdminNotes('');
                      setActiveAction('reject_return');
                    }}
                  >
                    Reject Return Request
                  </button>
                </div>
              </div>
            )}

            {['RETURN_APPROVED', 'RETURN_REJECTED'].includes(order.orderStatus) && (
              <div
                className="admin-variants-section"
                style={{
                  borderLeft: order.orderStatus === 'RETURN_APPROVED' ? '4px solid #16a34a' : '4px solid #C65D3B',
                }}
              >
                <h3>RETURN REQUEST DECISION RECORD</h3>
                <div className="info-key-val">
                  <span>Decision:</span>
                  <StatusBadge status={order.orderStatus} type="order" />
                </div>
                <div className="info-key-val">
                  <span>Processed At:</span>
                  <span>{order.returnProcessedAt ? new Date(order.returnProcessedAt).toLocaleString() : 'N/A'}</span>
                </div>
                {order.returnAdminNotes && (
                  <div className="info-key-val">
                    <span>Admin Notes:</span>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>{order.returnAdminNotes}</p>
                  </div>
                )}
              </div>
            )}

            <div className="order-status-update-box">
              <h3>ORDER STATUS TRANSITION CONTROL</h3>
              {['DELIVERED', 'CANCELLED', 'FAILED', 'RETURN_APPROVED', 'RETURN_REJECTED'].includes(order.orderStatus) ? (
                <p className="status-terminal-note">
                  This order is in terminal or return-processed state <strong>{order.orderStatus}</strong>.
                </p>
              ) : (
                <div className="status-transition-controls">
                  <span>Current State: <StatusBadge status={order.orderStatus} type="order" /></span>
                  <span className="transition-arrow">&rarr;</span>
                  <select
                    value={selectedNextStatus}
                    onChange={(e) => setSelectedNextStatus(e.target.value)}
                    className="admin-select-input"
                  >
                    {(() => {
                      const allowedTransitions = {
                        PLACED: ['CONFIRMED', 'CANCELLED', 'FAILED'],
                        CONFIRMED: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
                        PROCESSING: ['SHIPPED', 'CANCELLED'],
                        SHIPPED: ['DELIVERED', 'CANCELLED'],
                      };
                      const options = allowedTransitions[order.orderStatus] || [];
                      return options.map((opt) => (
                        <option key={opt} value={opt}>
                          Transition to {opt}
                        </option>
                      ));
                    })()}
                  </select>
                  <button
                    className="admin-submit-btn sm"
                    disabled={updatingStatus || !selectedNextStatus}
                    onClick={handleUpdateStatus}
                  >
                    {updatingStatus ? 'UPDATING...' : 'APPLY TRANSITION'}
                  </button>
                </div>
              )}
            </div>

            <div className="order-items-section">
              <h3>ORDERED GARMENTS & CUSTOMIZATIONS ({order.items ? order.items.length : 0})</h3>
              {order.items?.some((item) => !item.customized) && (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ITEM</th>
                        <th>SIZE</th>
                        <th>COLOUR</th>
                        <th>QTY</th>
                        <th>UNIT PRICE</th>
                        <th>SUBTOTAL</th>
                        <th>CUSTOMIZATION DETAILS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => !item.customized && (
                        <tr key={idx}>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.size}</td>
                          <td>{item.colour}</td>
                          <td>{item.quantity}</td>
                          <td>&#8377;{item.unitPrice}</td>
                          <td><strong>&#8377;{item.subtotal}</strong></td>
                          <td><span className="standard-item-note">Standard Base Garment</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="customized-order-items">
                {order.items?.map((item, idx) => item.customized && (
                  <article className="customized-order-item-card" key={idx}>
                    <div className="customization-snapshot-cell">
                      <section className="customized-order-item-summary" aria-label="Ordered garment">
                        <span className="custom-badge">BESPOKE STUDIO CREATION</span>
                        <h4>{item.name || `Customized item ${idx + 1}`}</h4>
                        <h5>ORDER ITEM</h5>
                        <dl>
                          <div><dt>Size</dt><dd>{item.size || '—'}</dd></div>
                          <div><dt>Colour</dt><dd>{item.colour || '—'}</dd></div>
                          <div><dt>Quantity</dt><dd>{item.quantity ?? '—'}</dd></div>
                          <div><dt>Unit Price</dt><dd>&#8377;{item.unitPrice ?? '—'}</dd></div>
                          <div className="customized-order-item-subtotal"><dt>Subtotal</dt><dd>&#8377;{item.subtotal ?? '—'}</dd></div>
                        </dl>
                      </section>
                      <OrderCustomizationPreview item={item} itemIndex={idx} />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="admin-modal-actions">
          <button className="admin-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {activeAction === 'approve_return' && (
        <div className="admin-modal-overlay" style={{ zIndex: 3000 }} onClick={() => setActiveAction(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>APPROVE RETURN REQUEST</h2>
              <button className="admin-modal-close" onClick={() => setActiveAction(null)} disabled={actionLoading}>
                ✕
              </button>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#333', marginBottom: '16px' }}>
              Approving this request allows the order to proceed to refund processing.
            </p>

            <div className="admin-variants-section" style={{ marginBottom: '20px' }}>
              <div className="info-key-val">
                <span>Order Reference:</span>
                <strong>#{orderId.slice(-8).toUpperCase()}</strong>
              </div>
              <div className="info-key-val">
                <span>Customer:</span>
                <strong>{order?.user?.name} ({order?.user?.email})</strong>
              </div>
              <div className="info-key-val">
                <span>Return Reason:</span>
                <span>{order?.returnReason}</span>
              </div>
              {order?.returnDetails && (
                <div className="info-key-val">
                  <span>Return Details:</span>
                  <span>{order?.returnDetails}</span>
                </div>
              )}
              <div className="info-key-val">
                <span>Garment Condition:</span>
                <strong>{order?.isDefectiveOrDamaged ? 'Defective or Damaged Garment' : 'Standard Garment Return'}</strong>
              </div>
            </div>

            <div className="admin-modal-actions" style={{ justifyContent: 'flex-end', gap: '12px' }}>
              <button className="admin-btn-secondary" onClick={() => setActiveAction(null)} disabled={actionLoading}>
                Cancel
              </button>
              <button
                className="admin-submit-btn"
                disabled={actionLoading}
                onClick={() => handleProcessReturn('RETURN_APPROVED')}
              >
                {actionLoading ? 'Approving...' : 'Confirm Approve Return'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeAction === 'reject_return' && (
        <div className="admin-modal-overlay" style={{ zIndex: 3000 }} onClick={() => setActiveAction(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>REJECT RETURN REQUEST</h2>
              <button className="admin-modal-close" onClick={() => setActiveAction(null)} disabled={actionLoading}>
                ✕
              </button>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#333', marginBottom: '16px' }}>
              Are you sure you wish to reject this return request?
            </p>

            <div className="admin-input-group" style={{ marginBottom: '20px' }}>
              <label>ADMIN NOTES / REASON FOR REJECTION (OPTIONAL)</label>
              <textarea
                rows={3}
                placeholder="Provide notes or explanation for the customer/record..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                disabled={actionLoading}
              />
            </div>

            <div className="admin-modal-actions" style={{ justifyContent: 'flex-end', gap: '12px' }}>
              <button className="admin-btn-secondary" onClick={() => setActiveAction(null)} disabled={actionLoading}>
                Cancel
              </button>
              <button
                className="admin-submit-btn"
                style={{ backgroundColor: '#C65D3B', borderColor: '#C65D3B' }}
                disabled={actionLoading}
                onClick={() => handleProcessReturn('RETURN_REJECTED')}
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Reject Return'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeAction === 'refund' && (
        <div className="admin-modal-overlay" style={{ zIndex: 3000 }} onClick={() => setActiveAction(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>PROCESS RAZORPAY REFUND</h2>
              <button className="admin-modal-close" onClick={() => setActiveAction(null)} disabled={actionLoading}>
                ✕
              </button>
            </div>

            <div className="admin-variants-section" style={{ marginBottom: '20px' }}>
              <div className="info-key-val">
                <span>Order Reference:</span>
                <strong>#{orderId.slice(-8).toUpperCase()}</strong>
              </div>
              <div className="info-key-val">
                <span>Customer:</span>
                <strong>{order?.user?.name} ({order?.user?.email})</strong>
              </div>
              <div className="info-key-val">
                <span>Refund Context:</span>
                <span>{order?.orderStatus === 'CANCELLED' ? 'Order Cancellation Refund' : 'Return Approved Refund'}</span>
              </div>
              <div className="info-key-val">
                <span>Amount to be Refunded:</span>
                <strong style={{ fontSize: '1.2rem', color: '#16a34a' }}>&#8377;{order?.totalAmount}</strong>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#666', marginBottom: '20px' }}>
              The refund amount is strictly bound to the order total (&#8377;{order?.totalAmount}) returned by the server and will be issued automatically via Razorpay gateway.
            </p>

            <div className="admin-modal-actions" style={{ justifyContent: 'flex-end', gap: '12px' }}>
              <button className="admin-btn-secondary" onClick={() => setActiveAction(null)} disabled={actionLoading}>
                Cancel
              </button>
              <button
                className="admin-submit-btn"
                disabled={actionLoading}
                onClick={handleProcessRefund}
              >
                {actionLoading ? 'Processing Refund...' : 'Confirm & Execute Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailModal;
