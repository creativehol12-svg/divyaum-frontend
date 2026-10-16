"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Header.module.scss";
import AuthModal from "@/components/AuthModal/AuthModal";
import HeaderSearch from "@/components/HeaderSearch/HeaderSearch";

import {
  getClientCartSnapshot,
  hydrateCartFromServerIfLoggedIn,
  resetCartAfterLogout,
} from "@/components/StoreProductCard/cartApi";
import { logoutFromApi } from "@/lib/authApi";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [cartBadgeCount, setCartBadgeCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openCartAfterLogin, setOpenCartAfterLogin] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";

  const getNavClassName = (href) =>
    `${styles.navLink} ${pathname === href ? styles.navLinkActive : ""}`.trim();

  const getMobileNavClassName = (href) =>
    `${styles.mobileNavLink} ${pathname === href ? styles.mobileNavLinkActive : ""}`.trim();

  const closeMobileMenu = () => setMenuOpen(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/online-pooja", label: "Online Pooja" },
    { href: "/online-astrology", label: "Astrology" },
    { href: "/divya-store", label: "Divya Store" },
    { href: "/about-us", label: "About Us" },
  ];

  const refreshUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:4000";
    const res = await fetch(`${baseUrl}/api/user-details`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      localStorage.removeItem("token");
      setUser(null);
      return;
    }

    const data = await res.json();
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data?.user ?? data);

  } catch {
    setUser(null);
  }
};

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const syncCartBadge = useCallback(() => {
    // Badge should show cart lines count (cards), not total quantity.
    setCartBadgeCount(getClientCartSnapshot().length);
  }, []);

  useEffect(() => {
    syncCartBadge();
    window.addEventListener("divyaum-cart-updated", syncCartBadge);
    return () => {
      window.removeEventListener("divyaum-cart-updated", syncCartBadge);
    };
  }, [syncCartBadge]);

  useEffect(() => {
    void hydrateCartFromServerIfLoggedIn().then(syncCartBadge);
  }, [user, syncCartBadge]);
  useEffect(() => { refreshUser(); }, [pathname]);

  useEffect(() => {
    const handleUserUpdate = () => {
      void refreshUser().then(() =>
        hydrateCartFromServerIfLoggedIn().then(syncCartBadge),
      );
    };
    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, [syncCartBadge]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleAuthModalClose = async () => {
    setAuthModalOpen(false);
    await refreshUser();
    await hydrateCartFromServerIfLoggedIn();
    syncCartBadge();
    if (openCartAfterLogin && localStorage.getItem("token")) {
      setOpenCartAfterLogin(false);
      router.push("/cart");
    }
  };

  const openLogin = () => {
    setAuthView("login");
    setAuthModalOpen(true);
    setMenuOpen(false);
  };

  const handleCartClick = () => {
    if (user) {
      router.push("/cart");
      return;
    }
    setOpenCartAfterLogin(true);
    openLogin();
  };

  const handleLogout = async () => {
    try {
      await logoutFromApi();
    } catch {
      // Clear local session even if the API call fails (offline / expired cookie).
    }

    resetCartAfterLogout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("selectedPackage");
    setUser(null);
    setDropdownOpen(false);
    setMenuOpen(false);
    window.dispatchEvent(new Event("userUpdated"));
    router.refresh();
  };

  return (
    <>
      <header
        className={`${styles.header} ${isHomePage ? styles.homeHeader : styles.pageHeader} ${isScrolled ? styles.scrolled : ""}`.trim()}
      >
        <div className={`container ${styles.inner} ${searchOpen ? styles.innerSearchOpen : ""}`}>

          {/* Logo */}
          <a href="/" className={styles.brand} aria-label="Go to homepage">
            <span className={styles.logoWrap} aria-hidden="true">
              <Image src="/icon/divyaum logo.png" alt="" width={128} height={50} priority />
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className={styles.nav} aria-label="Primary">
            <Link className={getNavClassName("/")} href="/">Home</Link>
            <Link className={getNavClassName("/online-pooja")} href="/online-pooja">Online Pooja</Link>
            <Link className={getNavClassName("/online-astrology")} href="/online-astrology">Vedic Astrology</Link>
            <Link className={getNavClassName("/divya-store")} href="/divya-store">Divya Store</Link>
            <Link className={getNavClassName("/about-us")} href="/about-us">About Us</Link>
           
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <HeaderSearch onOpenChange={setSearchOpen} />

            <button
              type="button"
              className={styles.cartLink}
              onClick={handleCartClick}
              aria-label={
                cartBadgeCount > 0
                  ? `Open cart, ${cartBadgeCount} ${cartBadgeCount === 1 ? "product" : "products"}`
                  : "Open cart"
              }
            >
              <span className={styles.cartIconWrap}>
                <svg className={styles.cartIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 18a2 2 0 1 0 0.001 4A2 2 0 0 0 7 18Zm10 0a2 2 0 1 0 0.001 4A2 2 0 0 0 17 18Zm1.7-3H7.1a2 2 0 0 1-1.96-1.58L3.7 4H2a1 1 0 1 1 0-2h2a1 1 0 0 1 .98.79L5.45 5H21a1 1 0 0 1 .97 1.24l-1.7 6.81A2 2 0 0 1 18.7 14ZM7.45 7l.84 4.92a.5.5 0 0 0 .49.41h8.82a.5.5 0 0 0 .49-.38L19.58 7H7.45Z" />
                </svg>
                {cartBadgeCount > 0 ? (
                  <span className={styles.cartBadge} aria-hidden="true">
                    {cartBadgeCount > 99 ? "99+" : cartBadgeCount}
                  </span>
                ) : null}
              </span>
              <span className={styles.cartText}>Cart</span>
            </button>

            {/* ✅ Profile / Login — baad mein */}
            {user ? (
              <div className={styles.profileWrap} ref={dropdownRef}>
                <button
                  className={styles.profileIcon}
                  onClick={() => {
                    setMenuOpen(false);
                    setDropdownOpen((prev) => !prev);
                  }}
                  aria-label="Profile menu"
                >
                  <svg viewBox="0 0 24 24" className={styles.profileSvg} aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownUser}>
                      <span className={styles.dropdownName}>{user?.name ?? "User"}</span>
                      <span className={styles.dropdownEmail}>{user?.email ?? ""}</span>
                    </div>
                    <div className={styles.dropdownDivider} />
                    {/* <Link href="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <svg viewBox="0 0 24 24" className={styles.dropdownIcon}>
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                      View Profile
                    </Link> */}
                    <Link href="/my-bookings" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <svg viewBox="0 0 24 24" className={styles.dropdownIcon}>
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      My Bookings
                    </Link>
                    <Link href="/my-orders" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <svg viewBox="0 0 24 24" className={styles.dropdownIcon}>
                        <path d="M3 7h18M6 11h12M9 15h6M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
                      </svg>
                      My Orders
                    </Link>
                    <Link href="/profile/address" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <svg viewBox="0 0 24 24" className={styles.dropdownIcon}>
                        <path d="M20 10c0 4.4-3.6 8-8 12-4.4-4-8-7.6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      My Addresses
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <button className={styles.dropdownLogout} onClick={handleLogout}>
                      <svg viewBox="0 0 24 24" className={styles.dropdownIcon}>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className={styles.loginLink} onClick={openLogin}>
                Login
              </button>
            )}

            {/* Hamburger */}
            <button
              className={styles.hamburger}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span className={`${styles.bar} ${menuOpen ? styles.barTop : ""}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.barMid : ""}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.barBot : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen ? (
          <>
            <button
              type="button"
              className={styles.mobileBackdrop}
              onClick={closeMobileMenu}
              aria-label="Close menu"
            />
            <div className={styles.mobileMenu} role="dialog" aria-modal="true" aria-label="Mobile navigation">
              <p className={styles.mobileMenuTitle}>Menu</p>

              <nav className={styles.mobileNav} aria-label="Mobile primary">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    className={getMobileNavClassName(item.href)}
                    href={item.href}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className={styles.mobileQuickRow}>
                <button
                  type="button"
                  className={styles.mobileQuickBtn}
                  onClick={() => {
                    closeMobileMenu();
                    handleCartClick();
                  }}
                >
                  <svg className={styles.mobileQuickIcon} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 18a2 2 0 1 0 0.001 4A2 2 0 0 0 7 18Zm10 0a2 2 0 1 0 0.001 4A2 2 0 0 0 17 18Zm1.7-3H7.1a2 2 0 0 1-1.96-1.58L3.7 4H2a1 1 0 1 1 0-2h2a1 1 0 0 1 .98.79L5.45 5H21a1 1 0 0 1 .97 1.24l-1.7 6.81A2 2 0 0 1 18.7 14ZM7.45 7l.84 4.92a.5.5 0 0 0 .49.41h8.82a.5.5 0 0 0 .49-.38L19.58 7H7.45Z" />
                  </svg>
                  Cart
                  {cartBadgeCount > 0 ? (
                    <span className={styles.mobileQuickBadge}>{cartBadgeCount > 99 ? "99+" : cartBadgeCount}</span>
                  ) : null}
                </button>
              </div>

              {!user ? (
                <>
                  <div className={styles.mobileDivider} />
                  <div className={styles.mobileAccount}>
                    <button type="button" className={styles.mobileLoginBtn} onClick={openLogin}>
                      Login
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </>
        ) : null}
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={handleAuthModalClose}
        defaultView={authView}
      />
    </>
  );
}