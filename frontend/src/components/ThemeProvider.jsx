import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";


/* ============================================================
   THEME CONTEXT
============================================================ */

const ThemeContext = createContext(null);


/* ============================================================
   THEME PROVIDER
============================================================ */

export function ThemeProvider({
  children,
}) {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme =
        localStorage.getItem(
          "cardiosense-theme"
        );

      if (
        savedTheme === "dark" ||
        savedTheme === "light"
      ) {
        return savedTheme;
      }
    } catch {
      // Ignore localStorage errors.
    }

    /*
     * CardioSense starts in light mode.
     * This keeps the product consistent with
     * the current design direction.
     */
    return "light";
  });


  /* ==========================================================
     APPLY THEME
  ========================================================== */

  useEffect(() => {
    const root =
      document.documentElement;

    root.classList.toggle(
      "dark",
      theme === "dark"
    );

    root.dataset.theme =
      theme;


    try {
      localStorage.setItem(
        "cardiosense-theme",
        theme
      );
    } catch {
      // Ignore localStorage errors.
    }
  }, [theme]);


  /* ==========================================================
     TOGGLE
  ========================================================== */

  const toggleTheme = () => {
    setTheme(
      (currentTheme) =>
        currentTheme === "light"
          ? "dark"
          : "light"
    );
  };


  /* ==========================================================
     EXPLICIT THEME SETTER
  ========================================================== */

  const changeTheme = (
    nextTheme
  ) => {
    if (
      nextTheme !== "light" &&
      nextTheme !== "dark"
    ) {
      return;
    }

    setTheme(nextTheme);
  };


  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: changeTheme,
        toggleTheme,
        isDark:
          theme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}


/* ============================================================
   HOOK
============================================================ */

export function useTheme() {
  const context =
    useContext(
      ThemeContext
    );


  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }


  return context;
}