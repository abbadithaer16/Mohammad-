import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const SIZES = [
  { id: '50', label: '50ml', price: 145 },
  { id: '100', label: '100ml', price: 210 },
];

// One signature product, presented like a boutique counter: a quiet side panel
// over the film rather than a store page.
const ShopDialog = forwardRef(function ShopDialog({ onAdd, bagCount }, ref) {
  const dialogRef = useRef(null);
  const [size, setSize] = useState(SIZES[0]);
  const [added, setAdded] = useState(false);
  const [closing, setClosing] = useState(false);

  const close = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return dialogRef.current?.close();
    setClosing(true);
    window.setTimeout(() => {
      dialogRef.current?.close();
      setClosing(false);
    }, 420);
  };

  useImperativeHandle(ref, () => ({
    open: () => {
      setAdded(false);
      dialogRef.current?.showModal();
    },
  }));

  const add = () => {
    onAdd({ product: 'NOIRÉ Signature 01', size: size.label, price: size.price });
    setAdded(true);
  };

  return (
    <dialog
      ref={dialogRef}
      className="shop-dialog"
      data-closing={closing}
      aria-labelledby="shop-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => e.target === dialogRef.current && close()}
    >
      <div className="shop-panel">
        <button type="button" className="shop-close" onClick={close} aria-label="Close">
          <span aria-hidden="true" />
        </button>

        <p className="shop-eyebrow">
          <span className="eyebrow-rule" aria-hidden="true" />
          Signature 01
        </p>
        <h2 id="shop-title" className="shop-title">
          NOIRÉ
        </h2>
        <p className="shop-kind">Eau de Parfum</p>
        <p className="shop-notes">Bergamot, rose, oud, amber.</p>

        <fieldset className="shop-sizes">
          <legend>Size</legend>
          {SIZES.map((s) => (
            <label key={s.id} className="shop-size" data-active={s.id === size.id}>
              <input
                type="radio"
                name="size"
                value={s.id}
                checked={s.id === size.id}
                onChange={() => {
                  setSize(s);
                  setAdded(false);
                }}
              />
              <span>{s.label}</span>
            </label>
          ))}
        </fieldset>

        <p className="shop-price">
          <span className="sr-only">Price </span>${size.price}
        </p>

        <button type="button" className="btn btn-primary shop-add" onClick={add} data-added={added}>
          <span>{added ? 'Added to bag' : 'Add to bag'}</span>
        </button>
        <p className="shop-status" role="status" aria-live="polite">
          {added ? `NOIRÉ Signature 01, ${size.label}, in your bag (${bagCount}).` : ''}
        </p>
      </div>
    </dialog>
  );
});

export default ShopDialog;
