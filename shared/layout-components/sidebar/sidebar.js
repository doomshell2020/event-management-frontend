
import React, { Fragment, useState, useEffect } from "react";
import { MENUITEMS } from "./nav";
import PerfectScrollbar from 'react-perfect-scrollbar';
import Link from "next/link"
import { useRouter } from "next/router";
let history = [];

const Sidebar = () => {
  let location = useRouter();
  let { basePath } = useRouter()
  const [menuitems, setMenuitems] = useState(MENUITEMS);
  const [adminLoginId, setAdminLoginId] = useState(localStorage.getItem("UserID_"));

  // useEffect(() => {
  //   // console.log('Admin Login ID:', adminLoginId);
  //   if (adminLoginId != 1) { // This is for lulu account
  //     const updatedMenuItems = menuitems.map(menu => {
  //       if (menu.Items) {
  //         const updatedItems = menu.Items.filter(item => item.title !== "Finance");
  //         return { ...menu, Items: updatedItems };
  //       }
  //       return menu;
  //     });
  //     setMenuitems(updatedMenuItems);
  //   }
  // }, [adminLoginId]); // This effect depends only on adminLoginId

  useEffect(() => {
    // console.log('Admin Login ID:', adminLoginId);
    if (adminLoginId == 12492) { // This is for lulu account
      const updatedMenuItems = menuitems.map(menu => {
        if (menu.Items) {
          const updatedItems = menu.Items.filter(item => item.title === "Finance");
          return { ...menu, Items: updatedItems };
        }
        return menu;
      });
      setMenuitems(updatedMenuItems);
    } else if (adminLoginId != 1) {
      const updatedMenuItems = menuitems.map(menu => {
        if (menu.Items) {
          const updatedItems = menu.Items.filter(item => item.title !== "Finance");
          return { ...menu, Items: updatedItems };
        }
        return menu;
      });
      setMenuitems(updatedMenuItems);
    }
  }, [adminLoginId]); // This effect depends only on adminLoginId

  // location



  useEffect(() => {
    if (document.body.classList.contains('horizontal') && window.innerWidth >= 992) {
      clearMenuActive();
    }
  }, []);

  // initial loading
  useEffect(() => {
    history.push(location.pathname);  // add  history to history  stack for current location.pathname to prevent multiple history calls innerWidth  and innerWidth  calls from  multiple users. This is important because the history stack is not always empty when the user clicks  the history       
    if (history.length > 2) {
      history.shift();
    }
    if (history[0] !== history[1]) {
      setSidemenu();
    }
    let mainContent = document.querySelector('.main-content');

    //when we click on the body to remove
    mainContent.addEventListener('click', mainContentClickFn);
    return () => {
      mainContent.removeEventListener('click', mainContentClickFn);
    }
  }, [location])

  //  In Horizontal When we click the body it should we Closed using in useEfffect Refer line No:16
  function mainContentClickFn() {
    if (document.body.classList.contains('horizontal') && window.innerWidth >= 992) {
      clearMenuActive();
    }
  }
  //<-------End---->
  function setSidemenu() {
    if (menuitems) {
      menuitems.filter(mainlevel => {
        if (mainlevel.Items) {
          mainlevel.Items.filter((items) => {
            items.active = false;
            items.selected = false;
            if (location.pathname === '/nowa/preview/' || location.pathname === '/nowa/preview/') {
              location.pathname = '/nowa/preview/dashboard/dashboard-1/';
            }
            if (location.pathname === items.path) {
              items.active = true;
              items.selected = true;
            }
            //Rupam added 06-03-2024
            if (location.pathname.startsWith(items.path)) {
              items.active = true;
              items.selected = true;
            }

            if (items.children) {
              items.children.filter(submenu => {
                submenu.active = false;
                submenu.selected = false;
                if (location.pathname === submenu.path) {
                  items.active = true;
                  items.selected = true;
                  submenu.active = true;
                  submenu.selected = true;
                }
                if (submenu.children) {
                  submenu.children.filter(submenu1 => {
                    submenu1.active = false;
                    submenu1.selected = false;
                    if (location.pathname === submenu1.path) {
                      items.active = true;
                      items.selected = true;
                      submenu.active = true;
                      submenu.selected = true;
                      submenu1.active = true;
                      submenu1.selected = true;
                    }
                    return submenu1;
                  })
                }
                return submenu;
              })
            }
            return items;
          })
        }
        setMenuitems(arr => [...arr]);
        return mainlevel;
      })
    }
  }
  function toggleSidemenu(item) {

    if (
      !document.body.classList.contains("horizontalmenu-hover") ||
      window.innerWidth < 992
    ) {
      // To show/hide the menu
      if (!item.active) {
        menuitems.filter(mainlevel => {
          if (mainlevel.Items) {
            mainlevel.Items.filter(sublevel => {
              sublevel.active = false;
              if (item === sublevel) {
                sublevel.active = true;
              }
              if (sublevel.children) {
                sublevel.children.filter(sublevel1 => {
                  sublevel1.active = false;
                  if (item === sublevel1) {
                    sublevel.active = true;
                    sublevel1.active = true;
                  }
                  if (sublevel1.children) {
                    sublevel1.children.filter(sublevel2 => {
                      sublevel2.active = false;
                      if (item === sublevel2) {
                        sublevel.active = true;
                        sublevel1.active = true;
                        sublevel2.active = true;
                      }
                      if (sublevel2.children) {
                        sublevel2.children.filter(sublevel3 => {
                          sublevel3.active = false;
                          if (item === sublevel3) {
                            sublevel.active = true;
                            sublevel1.active = true;
                            sublevel2.active = true;
                            sublevel3.active = true;
                          }
                          return sublevel2;
                        })
                      }
                      return sublevel2;
                    })
                  }
                  return sublevel1;
                })
              }
              return sublevel;
            })
          }
          return mainlevel;
        })
      }
      else {
        item.active = !item.active;
      }
    }

    setMenuitems(arr => [...arr]);
  }
  function clearMenuActive() {
    MENUITEMS.filter(mainlevel => {
      if (mainlevel.Items) {
        mainlevel.Items.filter(sublevel => {
          sublevel.active = false;
          if (sublevel.children) {
            sublevel.children.filter(sublevel1 => {
              sublevel1.active = false;
              if (sublevel1.children) {
                sublevel1.children.filter(sublevel2 => {
                  sublevel2.active = false;
                  if (sublevel2.children) {
                    sublevel2.children.filter(sublevel3 => {
                      sublevel3.active = false;
                      return sublevel3;
                    })
                  }
                  return sublevel2;
                })
              }
              return sublevel1;
            })
          }
          return sublevel;
        })
      }
      return mainlevel;
    })
    setMenuitems(arr => [...arr]);
  }
  //Hover effect
  function Onhover() {
    if (document.querySelector(".app")) {
      if (document.querySelector(".app").classList.contains("sidenav-toggled"))
        document.querySelector(".app").classList.add("sidenav-toggled-open");
    }
  }
  function Outhover() {
    if (document.querySelector(".app")) {
      document.querySelector(".app").classList.remove("sidenav-toggled-open");
    }
  }

  // close Sidebar 
  const closeSidebar = () => {
    if (window.innerWidth < 992) {
      document.body.classList.remove("sidenav-toggled");
    }
  };



  return (
    <div className="sticky">
      <aside
        className="app-sidebar horizontal-main"
        onMouseOver={() => Onhover()}
        onMouseOut={() => Outhover()}
      >
        <PerfectScrollbar
          options={{ suppressScrollX: true }}
          className="hor-scroll"
          style={{ position: "absolute" }}
        >
          <div className="main-sidebar-header active">
            <Link className="header-logo active" href={`/admin/index/`}>
              <img
                src={`${process.env.NODE_ENV == 'production' ? basePath : ''}/black-logo.png`}
                className="main-logo  desktop-logo"
                alt="logo"
              />

              <img
                src={`${process.env.NODE_ENV == 'production' ? basePath : ''}/black-logo.png`}
                className="main-logo  desktop-dark"
                alt="logo"
              />
              <img
                src={`${process.env.NODE_ENV == 'production' ? basePath : ''}/black-logo.png`}
                className="main-logo  mobile-logo"
                alt="logo"
              />
              <img
                src={`${process.env.NODE_ENV == 'production' ? basePath : ''}/black-logo.png`}
                className="main-logo  mobile-dark"
                alt="logo"
              />
            </Link>
          </div>
          <div className="main-sidemenu ">
            <div className="slide-left disabled d-none" id="slide-left">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#7b8191"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z" />
              </svg>
            </div>

            <ul className="side-menu">
              {menuitems.map((Item, itemi) => (
                <Fragment key={itemi}>
                  {Item.Items.map((menuItem, i) => (
                    <li
                      className={`slide ${menuItem.selected ? "is-expanded" : ""} ${menuItem.active ? "is-expanded" : ""
                        }`}
                      key={i}
                    >
                      {menuItem.type === "link" && (
                        <Link
                          href={menuItem.path}
                          className={`side-menu__item ${menuItem.selected ? "active" : ""}`}
                          onClick={closeSidebar}
                        >
                          {menuItem.icon}
                          <span className="side-menu__label">{menuItem.title}</span>
                          {menuItem.badge && (
                            <label className={menuItem.badge}>{menuItem.badgetxt}</label>
                          )}
                        </Link>
                      )}

                      {menuItem.type === "sub" && (
                        <button
                          type="button"
                          onClick={() => toggleSidemenu(menuItem)}
                          className={`side-menu__item ${menuItem.selected ? "active is-expanded" : ""
                            }`}
                        >
                          {menuItem.icon}
                          <span className="side-menu__label">{menuItem.title}</span>
                          {menuItem.badge && (
                            <label className={`${menuItem.badge} side-badge`}>
                              {menuItem.badgetxt}
                            </label>
                          )}
                        </button>
                      )}

                      {menuItem.children && (
                        <ul
                          className={`slide-menu ${menuItem.active ? "open" : ""}`}
                          style={
                            menuItem.active ? { display: "block" } : { display: "none" }
                          }
                        >
                          {menuItem.children.map((childrenItem, index) => (
                            <li
                              key={index}
                              className={`sub-slide ${childrenItem.selected ? "is-expanded" : ""
                                } ${childrenItem.active ? "is-expanded" : ""}`}
                            >
                              {childrenItem.type === "sub" && (
                                <button
                                  type="button"
                                  className={`slide-item ${childrenItem.selected ? "active is-expanded" : ""
                                    }`}
                                  onClick={() => toggleSidemenu(childrenItem)}
                                >
                                  <span className="sub-side-menu__label">
                                    {childrenItem.title}
                                  </span>
                                  <i className="sub-angle fe fe-chevron-right"></i>
                                </button>
                              )}

                              {childrenItem.type === "link" && (
                                <Link
                                  href={childrenItem.path}
                                  className={`slide-item ${location.pathname === childrenItem.path ? " active" : ""
                                    }`}
                                >
                                  {childrenItem.title}
                                </Link>
                              )}

                              {childrenItem.children && (
                                <ul
                                  className={`sub-slide-menu ${childrenItem.selected ? "open" : ""
                                    }`}
                                  style={
                                    childrenItem.active
                                      ? { display: "block" }
                                      : { display: "none" }
                                  }
                                >
                                  {childrenItem.children.map((childrenSubItem, key) => (
                                    <li key={key}>
                                      {childrenSubItem.type === "link" && (
                                        <Link
                                          href={childrenSubItem.path}
                                          className={`sub-side-menu__item ${location.pathname === childrenSubItem.path
                                              ? " active"
                                              : ""
                                            }`}
                                        >
                                          <span className="sub-side-menu__label">
                                            {childrenSubItem.title}
                                          </span>
                                        </Link>
                                      )}

                                      {childrenSubItem.type === "sub" && (
                                        <span
                                          className={`sub-slide2 ${childrenSubItem.selected ? "is-expanded" : ""
                                            } ${childrenSubItem.active ? "is-expanded" : ""
                                            }`}
                                        >
                                          <button
                                            type="button"
                                            className="sub-side-menu__item"
                                            onClick={() =>
                                              toggleSidemenu(childrenSubItem)
                                            }
                                          >
                                            <span className="sub-side-menu__label">
                                              {childrenSubItem.title}
                                            </span>
                                            <i className="sub-angle2 fe fe-chevron-down"></i>
                                          </button>
                                          {childrenSubItem.children && (
                                            <ul
                                              className={`sub-slide-menu1 ${childrenSubItem.selected ? "open" : ""
                                                }`}
                                              style={
                                                childrenSubItem.active
                                                  ? { display: "block" }
                                                  : { display: "none" }
                                              }
                                            >
                                              {childrenSubItem.children.map(
                                                (childrenSubItemsubs, k) => (
                                                  <li key={k}>
                                                    <Link
                                                      className="sub-slide-item2"
                                                      href={childrenSubItemsubs.path}
                                                    >
                                                      {childrenSubItemsubs.title}
                                                    </Link>
                                                  </li>
                                                )
                                              )}
                                            </ul>
                                          )}
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </Fragment>
              ))}
            </ul>

            {/* <div className="slide-right" id="slide-right">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#7b8191"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z" />
              </svg>
            </div> */}

          </div>
        </PerfectScrollbar>
      </aside>
    </div>
  );
}

Sidebar.propTypes = {};

Sidebar.defaultProps = {};
export default Sidebar;




