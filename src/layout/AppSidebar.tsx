import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  BoltIcon,
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import {
  Cog6ToothIcon,
  UserPlusIcon,
  UserGroupIcon,
  ServerStackIcon,
  MapIcon,
  HomeModernIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};
type MenuType = "main" | "others" | "general";

const AppSidebar: React.FC<{ role: string | null }> = ({ role }) => {

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: MenuType;
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  

  // ==============================
  // 🔹 DEFINISI MENU UTAMA
  // ==============================
  const navItems: NavItem[] = [
    { icon: <GridIcon />, name: "Dashboard", path: "/" },
    {
      name: "Data Barang",
      icon: <BoxCubeIcon />,
      subItems: [
        { name: "Barang", path: "/barang", pro: true },
        { name: "Supplier", path: "/supplier" },
        { name: "Kategori", path: "/kategori" },
      ],
    },
    { icon: <ServerStackIcon />, name: "Devices", path: "/device" },
    { icon: <AdjustmentsHorizontalIcon />, name: "Monitoring", path: "/monitoring" },
    { icon: <DocumentTextIcon />, name: "Summary", path: "/summary" },
    { icon: <MapIcon />, name: "Side Area", path: "/area" },
  ];

  const generalItems: NavItem[] = [
    { icon: <BoltIcon />, name: "Paket Internet", path: "/paket" },
    { icon: <UserPlusIcon />, name: "User Registration", path: "/registrasi-user" },
  ];

  const othersItems: NavItem[] = [
    { icon: <UserGroupIcon />, name: "Account List", path: "/users" },
    { icon: <Cog6ToothIcon />, name: "Settings", path: "/profile" },
  ];

  // ==============================
  // 🔹 FILTER MENU BERDASARKAN ROLE
  // ==============================
  let filteredNavItems = navItems;
  let filteredGeneralItems = generalItems;
  let filteredOthersItems = othersItems;

 if (role === "admin") {
  // 🔹 Admin bisa lihat semua menu
  filteredNavItems = navItems;
  filteredGeneralItems = generalItems;
  filteredOthersItems = othersItems;

} else if (role === "noc") {
  // 🔹 NOC hanya lihat nav dan others (tanpa general)
  filteredNavItems = navItems;
  filteredGeneralItems = []; // kosong, jadi tidak ditampilkan
  filteredOthersItems = othersItems.filter(
    (item) => item.name !== "Account List"
  );

} else if (role === "user") {
  // 🔹 User biasa hanya dashboard dan menu tertentu
  filteredNavItems = navItems.filter((item) => item.name === "Dashboard");
  filteredGeneralItems = generalItems;
  filteredOthersItems = othersItems.filter(
    (item) => item.name === "Account List"
  );
}


  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    (["main", "others", "general"] as MenuType[]).forEach((menuType) => {
      const items =
        menuType === "main"
          ? filteredNavItems
          : menuType === "others"
          ? filteredOthersItems
          : filteredGeneralItems;

      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType, index });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) setOpenSubmenu(null);
  }, [location, isActive, role]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: MenuType) => {
    setOpenSubmenu((prev) =>
      prev && prev.type === menuType && prev.index === index
        ? null
        : { type: menuType, index }
    );
  };

  // ==============================
  // 🔹 RENDER MENU
  // ==============================
  const renderMenuItems = (items: NavItem[], menuType: MenuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            Main
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  // ==============================
  // 🔹 RETURN SIDEBAR
  // ==============================
  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
      ${
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
          ? "w-[290px]"
          : "w-[90px]"
      }
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center">
              <HomeModernIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              <h1 className="font-bold text-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent ml-2">
                Nura App
              </h1>
            </div>
          ) : (
            <HomeModernIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Main Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>

            {filteredGeneralItems.length > 0 && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "General"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(filteredGeneralItems, "general")}
              </div>
            )}

            {filteredOthersItems.length > 0 && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Others"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(filteredOthersItems, "others")}
              </div>
            )}
          </div>
        </nav>

        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
