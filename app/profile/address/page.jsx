"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import AddressAddModal from "@/components/AddressAddModal/AddressAddModal";
import AddressCard from "@/components/AddressCard/AddressCard";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { getStoredToken, getStoredUserId } from "@/components/StoreProductCard/cartApi";
import {
  addCustomerAddress,
  deleteCustomerAddress,
  fetchCustomerAddresses,
  updateCustomerAddress,
} from "@/lib/addressApi";

import styles from "./page.module.scss";

export default function AddressPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [addressListError, setAddressListError] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  useEffect(() => {
    if (addresses.length === 0) {
      setSelectedAddressId(null);
      return;
    }
    setSelectedAddressId((prev) =>
      prev && addresses.some((a) => a.id === prev) ? prev : addresses[0].id,
    );
  }, [addresses]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token && !user) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const loadAddresses = async () => {
      const userId = getStoredUserId();
      const token = getStoredToken();
      if (!userId || !token) {
        if (!cancelled) {
          setAddresses([]);
          setIsLoadingAddresses(false);
        }
        return;
      }

      if (!cancelled) {
        setAddressListError("");
      }

      try {
        const { addresses: list } = await fetchCustomerAddresses({ userId, token });
        if (!cancelled) {
          setAddresses(list);
        }
      } catch (err) {
        if (!cancelled) {
          setAddressListError(err?.message || "Could not load addresses.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAddresses(false);
        }
      }
    };

    void loadAddresses();
    return () => {
      cancelled = true;
    };
  }, []);

  const openModal = () => {
    setAddressListError("");
    setEditRecord(null);
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setAddressListError("");
    setEditRecord(row);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditRecord(null);
    setAddressListError("");
  };

  const handleRemoveAddress = async (id) => {
    const token = getStoredToken();
    if (!token) {
      setAddressListError("Please sign in again to remove an address.");
      return;
    }
    setAddressListError("");
    setDeletingAddressId(id);
    let closeModalAfter = false;
    try {
      await deleteCustomerAddress({ token, addressId: id });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setEditRecord((er) => {
        if (er?.id === id) {
          closeModalAfter = true;
          return null;
        }
        return er;
      });
      if (closeModalAfter) {
        setModalOpen(false);
      }
    } catch (err) {
      setAddressListError(err?.message || "Could not delete address.");
    } finally {
      setDeletingAddressId(null);
    }
  };

  const createAddress = useCallback(async (fields) => {
    const userId = getStoredUserId();
    const token = getStoredToken();
    return addCustomerAddress({ userId, token, ...fields });
  }, []);

  const updateAddress = useCallback(async ({ id, Line1, Line2, city, state, country, Pincode }) => {
    const token = getStoredToken();
    return updateCustomerAddress({
      token,
      addressId: id,
      Line1,
      Line2,
      city,
      state,
      country,
      Pincode,
    });
  }, []);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className="container">
          <div className={styles.topRow}>
            <div>
              <p className={styles.kicker}>Profile</p>
              <h1 className={styles.title}>My addresses</h1>
              <p className={styles.subtitle}>
                Add delivery or contact addresses. New addresses are saved to your account.
              </p>
              <p className={styles.subtitle} style={{ marginTop: 4 }}>
                <Link href="/" style={{ color: "rgba(166, 58, 28, 0.9)", fontWeight: 700 }}>
                  ← Home
                </Link>
              </p>
            </div>
            <button type="button" className={styles.addBtn} onClick={openModal}>
              Add address
            </button>
          </div>

          {addressListError ? <p className={styles.listAlert}>{addressListError}</p> : null}

          {isLoadingAddresses ? (
            <div className={styles.empty}>Loading addresses…</div>
          ) : addresses.length === 0 ? (
            <div className={styles.empty}>
              No addresses yet. Use <strong>Add address</strong> on the right to add your first one.
            </div>
          ) : (
            <div className={styles.grid} role="radiogroup" aria-label="Your saved addresses">
              {addresses.map((row) => (
                <AddressCard
                  key={row.id}
                  row={row}
                  radioName="profile-address-pick"
                  selected={selectedAddressId === row.id}
                  onSelect={() => setSelectedAddressId(row.id)}
                  onEdit={() => openEditModal(row)}
                  onDelete={() => void handleRemoveAddress(row.id)}
                  deleteDisabled={deletingAddressId === row.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AddressAddModal
        open={modalOpen}
        editRecord={editRecord}
        onClose={closeModal}
        createAddress={createAddress}
        updateAddress={updateAddress}
        onSaved={(row) => {
          if (!row?.id) return;
          setAddressListError("");
          setAddresses((prev) => {
            const exists = prev.some((a) => a.id === row.id);
            if (exists) return prev.map((a) => (a.id === row.id ? row : a));
            return [...prev, row];
          });
        }}
        hint={
          editRecord?.id
            ? "Update the fields and save. Your card will refresh."
            : "Put the city after the last comma (e.g. “12 MG Road, Indore , Indore”). You can use new lines before that comma for street and landmark. Pincode and state are required."
        }
      />
    </div>
  );
}
