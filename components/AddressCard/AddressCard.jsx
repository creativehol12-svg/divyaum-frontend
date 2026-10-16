"use client";

import styles from "./AddressCard.module.scss";

function IconStreet() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
      />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3 12h18M12 3c2.8 3.8 2.8 16.2 0 20M12 3c-2.8 3.8-2.8 16.2 0 20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconState() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconPinCode() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 7h2v2H7V7Zm4 0h2v2h-2V7Zm4 0h2v2h-2V7ZM7 11h2v2H7v-2Zm4 0h2v2h-2v-2Zm4 0h2v2h-2v-2ZM7 15h2v2H7v-2Zm4 0h2v2h-2v-2Zm4 0h2v2h-2v-2Z"
        opacity="0.92"
      />
    </svg>
  );
}

/**
 * @param {object} props
 * @param {{ id: string, address: string, country?: string, state?: string, pincode?: string }} props.row
 * @param {() => void} props.onEdit
 * @param {() => void} props.onDelete
 * @param {boolean} [props.deleteDisabled]
 * @param {boolean} [props.selected] when `onSelect` is passed — this card is the active choice
 * @param {() => void} [props.onSelect] single-select: choose this address (card + radio)
 * @param {string} [props.radioName] `name` for native radio group (required if `onSelect` is used)
 */
export default function AddressCard({ row, onEdit, onDelete, deleteDisabled, selected, onSelect, radioName }) {
  const { address, country, state, pincode } = row;
  const selectable = Boolean(onSelect);

  const cardClass = [
    styles.card,
    selectable ? styles.cardSelectable : "",
    selectable && selected ? styles.cardSelected : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClass} onClick={selectable ? onSelect : undefined}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarStart}>
          {selectable && radioName ? (
            <label className={styles.radioLabel} onClick={(e) => e.stopPropagation()}>
              <input
                type="radio"
                name={radioName}
                checked={Boolean(selected)}
                onChange={onSelect}
                className={styles.radioInput}
                aria-label="Select this address"
              />
              <span className={styles.radioVisual} aria-hidden="true" />
            </label>
          ) : null}
          <span className={styles.pin} aria-hidden="true">
            <svg viewBox="0 0 24 24" className={styles.pinSvg}>
              <path fill="none" d="M20 10c0 4.4-3.6 8-8 12-4.4-4-8-7.6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" fill="none" />
            </svg>
          </span>
        </div>
        <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.iconEdit}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label="Edit address"
            title="Edit"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.83H5v-.92l7.06-7.06.92.92L5.92 20.08zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.iconDanger}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={deleteDisabled}
            aria-label="Remove address"
            title="Remove"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 3h6a1 1 0 0 1 1 1v1h4a1 1 0 1 1 0 2h-1v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7H4a1 1 0 1 1 0-2h4V4a1 1 0 0 1 1-1Zm1 2v0h4V5h-4Zm-3 2v13h10V7H7Zm3 3a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Z" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.metaList}>
        {address ? (
          <div className={styles.metaRow}>
            <span className={styles.metaIcon}>
              <IconStreet />
            </span>
            <div className={styles.metaBody}>
              <span className={styles.metaLabel}>Address</span>
              <span className={styles.metaValueAddress}>{address}</span>
            </div>
          </div>
        ) : null}

        {country ? (
          <div className={styles.metaRow}>
            <span className={styles.metaIcon}>
              <IconGlobe />
            </span>
            <div className={styles.metaBody}>
              <span className={styles.metaLabel}>Country</span>
              <span className={styles.metaValue}>{country}</span>
            </div>
          </div>
        ) : null}

        {state ? (
          <div className={styles.metaRow}>
            <span className={styles.metaIcon}>
              <IconState />
            </span>
            <div className={styles.metaBody}>
              <span className={styles.metaLabel}>State</span>
              <span className={styles.metaValue}>{state}</span>
            </div>
          </div>
        ) : null}

        {pincode ? (
          <div className={styles.metaRow}>
            <span className={styles.metaIcon}>
              <IconPinCode />
            </span>
            <div className={styles.metaBody}>
              <span className={styles.metaLabel}>PIN code</span>
              <span className={styles.metaValue}>{pincode}</span>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
