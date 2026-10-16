"use client";

import { useState } from "react";
import styles from "./BookingPopup.module.scss";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const GOTRA_LIST = [
    "Kashyap", "Bharadwaj", "Vashishtha", "Atri", "Vishwamitra",
    "Jamadagni", "Gautam", "Agastya", "Kaundinya", "Parashar",
    "Sandilya", "Shaunak", "Garg", "Kaushik", "Mudgal",
    "Angiras", "Pulastya", "Kratu", "Marichi", "Daksha",
    "I do not know my gotra",
];

const STEPS = ["Bill Details", "Your Details", "Address", "Overview"];

export default function BookingPopup({ pooja, slot, pkg, onClose, onConfirm }) {
    const [step, setStep] = useState(0);
    const [bookingDone, setBookingDone] = useState(false); // ✅ success state
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        whatsapp: "",
        member1: "",
        member2: "",
        gotra: "",
        pincode: "",
        state: "",
        address: "",
    });
    const [errors, setErrors] = useState({});

    const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

    const validateStep = () => {
        const e = {};
        if (step === 1) {
            if (!form.whatsapp || form.whatsapp.length < 10) e.whatsapp = "Enter valid WhatsApp number.";
            if (!form.member1) e.member1 = "Enter at least one member name.";
            if (!form.gotra) e.gotra = "Please select gotra.";
        }
        if (step === 2) {
            if (!form.pincode) e.pincode = "Enter pincode.";
            if (!form.state) e.state = "Enter state.";
            if (!form.address) e.address = "Enter address.";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const next = () => {
        if (!validateStep()) return;
        if (step < 3) setStep((s) => s + 1);
    };

    const back = () => {
        setErrors({});
        setStep((s) => s - 1);
    };

    const formatDate = (d) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("en-IN", {
            day: "numeric", month: "long", year: "numeric",
        });
    };

    const handleConfirmClick = async () => {
        setLoading(true);
        await onConfirm(form, () => setBookingDone(false));
        setLoading(false);
    };

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && !bookingDone && onClose()}>
            <div className={styles.popup}>

                {/* ✅ Success Screen */}
                {bookingDone ? (
                    <>
                        <div className={styles.successWrap}>
                            <div className={styles.successIcon}>🪔</div>
                            <h3 className={styles.successTitle}>Booking Confirmed!</h3>
                            <p className={styles.successText}>
                                Your pooja has been booked successfully. We will contact you on WhatsApp shortly.
                            </p>
                            <div className={styles.successDetails}>
                                <div className={styles.successRow}><span>Pooja</span><span>{pooja?.title}</span></div>
                                <div className={styles.successRow}><span>Date</span><span>{formatDate(slot?.date)}</span></div>
                                <div className={styles.successRow}><span>Time</span><span>{slot?.time}</span></div>
                                {/* <div className={styles.successRow}><span>Amount</span><span>₹ {(pkg?.price ?? 0).toLocaleString("en-IN")}</span></div> */}
                            </div>
                        </div>
                        <div className={styles.footer}>
                            <button className={styles.doneBtn} onClick={onClose}>
                                Done ✓
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Header */}
                        <div className={styles.header}>
                            <div className={styles.headerLeft}>
                                <p className={styles.headerKicker}>Pooja Booking</p>
                                <h2 className={styles.headerTitle}>{pooja?.title ?? "Pooja"}</h2>
                            </div>
                            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
                        </div>

                        {/* Step Indicator */}
                        <div className={styles.stepBar}>
                            {STEPS.map((label, i) => (
                                <div key={label} className={styles.stepItem}>
                                    <div className={`${styles.stepDot} ${i <= step ? styles.stepDotActive : ""}`}>
                                        {i < step ? "✓" : i + 1}
                                    </div>
                                    <span className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ""}`}>
                                        {label}
                                    </span>
                                    {i < STEPS.length - 1 && (
                                        <div className={`${styles.stepLine} ${i < step ? styles.stepLineActive : ""}`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Step Content */}
                        <div className={styles.body}>

                            {/* Step 0: Bill Details */}
                            {step === 0 && (
                                <div className={styles.stepContent}>
                                    <h3 className={styles.stepTitle}>Bill Details</h3>
                                    <div className={styles.billCard}>
                                        <div className={styles.billRow}>
                                            <span className={styles.billLabel}>Pooja</span>
                                            <span className={styles.billValue}>{pooja?.title ?? "—"}</span>
                                        </div>
                                        <div className={styles.billRow}>
                                            <span className={styles.billLabel}>Package</span>
                                            <span className={styles.billValue}>{pkg?.name ?? "—"}</span>
                                        </div>
                                        <div className={styles.billRow}>
                                            <span className={styles.billLabel}>Date</span>
                                            <span className={styles.billValue}>{formatDate(slot?.date)}</span>
                                        </div>
                                        <div className={styles.billRow}>
                                            <span className={styles.billLabel}>Time</span>
                                            <span className={styles.billValue}>{slot?.time ?? "—"}</span>
                                        </div>
                                        <div className={styles.billDivider} />
                                        <div className={`${styles.billRow} ${styles.billTotal}`}>
                                            <span className={styles.billLabel}>Total Amount</span>
                                            <span className={styles.billAmount}>₹ {(pkg?.price ?? 0).toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 1: Your Details */}
                            {step === 1 && (
                                <div className={styles.stepContent}>
                                    <h3 className={styles.stepTitle}>Enter Details for Your Pooja</h3>

                                    <div className={styles.field}>
                                        <label className={styles.fieldLabel}>WhatsApp Number</label>

                                        <PhoneInput
                                            country={"in"}   // default India
                                            value={form.whatsapp}
                                            className={styles.phoneInput}
                                            onChange={(phone) => set("whatsapp", phone)}
                                            inputStyle={{
                                                width: "100%",
                                                height: "42px",
                                                fontSize: "14px",
                                            }}
                                            buttonStyle={{
                                                border: "none",
                                            }}
                                            containerStyle={{
                                                width: "100%",
                                            }}
                                        />

                                        {errors.whatsapp && <p className={styles.error}>{errors.whatsapp}</p>}
                                    </div>

                                    <div className={styles.fieldRow}>
                                        <div className={styles.field}>
                                            <label className={styles.fieldLabel}>Member 1 Name</label>
                                            <input
                                                type="text"
                                                className={`${styles.input} ${errors.member1 ? styles.inputError : ""}`}
                                                value={form.member1}
                                                onChange={e => set("member1", e.target.value)}
                                                placeholder="Full name"
                                            />
                                            {errors.member1 && <p className={styles.error}>{errors.member1}</p>}
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.fieldLabel}>Member 2 Name <span className={styles.optional}>(optional)</span></label>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                value={form.member2}
                                                onChange={e => set("member2", e.target.value)}
                                                placeholder="Full name"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.fieldLabel}>Gotra</label>
                                        <select
                                            className={`${styles.input} ${styles.select} ${errors.gotra ? styles.inputError : ""}`}
                                            value={form.gotra}
                                            onChange={e => set("gotra", e.target.value)}
                                        >
                                            <option value="">Select Gotra</option>
                                            {GOTRA_LIST.map(g => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                        {errors.gotra && <p className={styles.error}>{errors.gotra}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Address — ✅ City/Area → Address */}
                            {step === 2 && (
                                <div className={styles.stepContent}>
                                    <h3 className={styles.stepTitle}>Add Your Address</h3>

                                     {/* ✅ Area/Colony → Address */}
                                    <div className={styles.field}>
                                        <label className={styles.fieldLabel}>Address</label>
                                        <textarea
                                            className={`${styles.input} ${styles.textarea} ${errors.address ? styles.inputError : ""}`}
                                            value={form.address}
                                            onChange={e => set("address", e.target.value)}
                                            placeholder="House no, road, area, colony..."
                                            rows={3}
                                        />
                                        {errors.address && <p className={styles.error}>{errors.address}</p>}
                                    </div>

                                    <div className={styles.fieldRow}>
                                        <div className={styles.field}>
                                            <label className={styles.fieldLabel}>Pin Code</label>
                                            <input
                                                type="text"
                                                className={`${styles.input} ${errors.pincode ? styles.inputError : ""}`}
                                                value={form.pincode}
                                                onChange={e => set("pincode", e.target.value)}
                                                placeholder="452001"
                                                maxLength={6}
                                            />
                                            {errors.pincode && <p className={styles.error}>{errors.pincode}</p>}
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.fieldLabel}>State</label>
                                            <input
                                                type="text"
                                                className={`${styles.input} ${errors.state ? styles.inputError : ""}`}
                                                value={form.state}
                                                onChange={e => set("state", e.target.value)}
                                                placeholder="Madhya Pradesh"
                                            />
                                            {errors.state && <p className={styles.error}>{errors.state}</p>}
                                        </div>
                                    </div>

                                   
                                </div>
                            )}

                            {/* Step 3: Overview */}
                            {step === 3 && (
                                <div className={styles.stepContent}>
                                    <h3 className={styles.stepTitle}>Overview</h3>

                                    <div className={styles.overviewGrid}>
                                        <div className={styles.overviewSection}>
                                            <div className={styles.overviewSectionHeader}>
                                            <p className={styles.overviewSectionTitle}>🪔 Booking</p>
                                             <button className={styles.editBtn} onClick={() => setStep(0)}>✎ Edit</button>
                                            </div>
                                            <div className={styles.overviewRow}><span>Pooja</span><span>{pooja?.title}</span></div>
                                            <div className={styles.overviewRow}><span>Package</span><span>{pkg?.name}</span></div>
                                            <div className={styles.overviewRow}><span>Date</span><span>{formatDate(slot?.date)}</span></div>
                                            <div className={styles.overviewRow}><span>Time</span><span>{slot?.time}</span></div>
                                            <div className={styles.overviewRow}><span>Amount</span><span className={styles.overviewAmount}>₹ {(pkg?.price ?? 0).toLocaleString("en-IN")}</span></div>
                                        </div>

                                        <div className={styles.overviewSection}>
                                            <div className={styles.overviewSectionHeader}>
                                                <p className={styles.overviewSectionTitle}>👤 Your Details</p>
                                                <button className={styles.editBtn} onClick={() => setStep(1)}>✎ Edit</button>
                                            </div>
                                            <div className={styles.overviewRow}><span>WhatsApp</span><span>{form.whatsapp}</span></div>
                                            <div className={styles.overviewRow}><span>Member 1</span><span>{form.member1}</span></div>
                                            {form.member2 && <div className={styles.overviewRow}><span>Member 2</span><span>{form.member2}</span></div>}
                                            <div className={styles.overviewRow}><span>Gotra</span><span>{form.gotra}</span></div>
                                        </div>

                                        <div className={styles.overviewSection}>
                                            <div className={styles.overviewSectionHeader}>
                                            <p className={styles.overviewSectionTitle}>📍 Address</p>
                                
                                            <button className={styles.editBtn} onClick={() => setStep(2)}>✎ Edit</button>
                                            </div>
                                            <div className={styles.overviewRow}><span>Pin Code</span><span>{form.pincode}</span></div>
                                            <div className={styles.overviewRow}><span>State</span><span>{form.state}</span></div>
                                            <div className={styles.overviewRow}><span>Address</span><span>{form.address}</span></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className={styles.footer}>
                            {step > 0 && (
                                <button className={styles.backBtn} onClick={back}>← Back</button>
                            )}
                            {step < 3 ? (
                                <button className={styles.nextBtn} onClick={next}>Next →</button>
                            ) : (
                                <button className={styles.bookBtn} onClick={handleConfirmClick} disabled={loading}>
                                    {loading ? "Booking..." : "🪔 Confirm Booking"}
                                </button>
                            )}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}