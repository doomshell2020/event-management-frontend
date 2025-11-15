export const MENUITEMS = [
  {
    // menutitle: "Main",
    Items: [
      {
        title: "Dashboard",
        icon: (
          <svg
            className="side-menu__icon"
            xmlns="http://www.w3.org/2000/svg"
            id="Layer_1"
            data-name="Layer 1"
            height="24"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="M14,12c0,1.019-.308,1.964-.832,2.754l-2.875-2.875c-.188-.188-.293-.442-.293-.707V7.101c2.282,.463,4,2.48,4,4.899Zm-6-.414V7.101c-2.55,.518-4.396,2.976-3.927,5.767,.325,1.934,1.82,3.543,3.729,3.992,1.47,.345,2.86,.033,3.952-.691l-3.169-3.169c-.375-.375-.586-.884-.586-1.414Zm11-4.586h-2c-.553,0-1,.448-1,1s.447,1,1,1h2c.553,0,1-.448,1-1s-.447-1-1-1Zm0,4h-2c-.553,0-1,.448-1,1s.447,1,1,1h2c.553,0,1-.448,1-1s-.447-1-1-1Zm0,4h-2c-.553,0-1,.448-1,1s.447,1,1,1h2c.553,0,1-.448,1-1s-.447-1-1-1Zm5-7v8c0,2.757-2.243,5-5,5H5c-2.757,0-5-2.243-5-5V8C0,5.243,2.243,3,5,3h14c2.757,0,5,2.243,5,5Zm-2,0c0-1.654-1.346-3-3-3H5c-1.654,0-3,1.346-3,3v8c0,1.654,1.346,3,3,3h14c1.654,0,3-1.346,3-3V8Z" />
          </svg>
        ),
        type: "sub",
        selected: false,
        active: false,
        path: `/admin/index`,
        type: "link",
        // children: [
        //   {
        //     path: `/components/dashboards/dashboard1`,
        //     type: "link",
        //     active: false,
        //     selected: false,
        //     title: "Dashboard-1",
        //   },
        // {
        //   path: `/components/dashboards/dashboard2`,
        //   type: "link",
        //   active: false,
        //   selected: false,
        //   title: "Dashboard-2",
        // },
        // {
        //   path: `/components/dashboards/dashboard3`,
        //   type: "link",
        //   active: false,
        //   selected: false,
        //   title: "Dashboard-3",
        // },
        // ],
      },
    ],
  },
    {
    Items: [
      {
        title: "Organizer",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="side-menu__icon"
            height="24"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v14c0 
                   1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 
                   16H5V9h14v11zm0-13H5V6h14v1z" />
          </svg>
        ),
        type: "link",
        selected: false,
        active: false,
        path: `/admin/organizer`,
      },
    ]
  },
  {
    Items: [
      {
        title: "Events",
        icon: (
          <svg
            className="side-menu__icon"
            xmlns="http://www.w3.org/2000/svg"
            id="Layer_1"
            data-name="Layer 1"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="m8,12h-2c-1.103,0-2,.897-2,2v2c0,1.103.897,2,2,2h2c1.103,0,2-.897,2-2v-2c0-1.103-.897-2-2-2Zm-2,4v-2h2v2s-2,0-2,0ZM19,2h-1v-1c0-.552-.447-1-1-1s-1,.448-1,1v1h-8v-1c0-.552-.447-1-1-1s-1,.448-1,1v1h-1C2.243,2,0,4.243,0,7v12c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V7c0-2.757-2.243-5-5-5Zm-14,2h14c1.654,0,3,1.346,3,3v1H2v-1c0-1.654,1.346-3,3-3Zm14,18H5c-1.654,0-3-1.346-3-3v-9h20v9c0,1.654-1.346,3-3,3Z" />
          </svg>
        ),
        type: "sub",
        selected: false,
        active: false,
        path: `/admin/events`,
        type: "link",
      },
    ],
  },

  {
    Items: [
      {
        title: "Members",
        icon: (
          <svg
            className="side-menu__icon"
            xmlns="http://www.w3.org/2000/svg"
            id="Layer_1"
            data-name="Layer 1"
            height="24"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="M12.006,12.309c3.611-.021,5.555-1.971,5.622-5.671-.062-3.56-2.111-5.614-5.634-5.637-3.561,.022-5.622,2.17-5.622,5.637,0,3.571,2.062,5.651,5.634,5.672Zm-.012-9.309c2.437,.016,3.591,1.183,3.634,3.636-.047,2.559-1.133,3.657-3.622,3.672-2.495-.015-3.582-1.108-3.634-3.654,.05-2.511,1.171-3.639,3.622-3.654Z" />
            <path d="M11.994,13.661c-5.328,.034-8.195,2.911-8.291,8.322-.01,.552,.43,1.008,.982,1.018,.516-.019,1.007-.43,1.018-.982,.076-4.311,2.08-6.331,6.291-6.357,4.168,.027,6.23,2.106,6.304,6.356,.01,.546,.456,.983,1,.983h.018c.552-.01,.992-.465,.983-1.017-.092-5.333-3.036-8.288-8.304-8.322Z" />
          </svg>
        ),
        type: "sub",
        selected: false,
        active: false,
        path: `/admin/members`,
        type: "link",
      },
    ],
  },

  {
    Items: [
      {
        // title: "Careyes Housing",
        title: "Housing",
        icon: (
          // <svg
          //   className="side-menu__icon"
          //   xmlns="http://www.w3.org/2000/svg"
          //   height="24"
          //   viewBox="0 0 24 24"
          //   width="24"
          // >
          //   <path d="M0 0h24v24H0V0z" fill="none" />
          //   <path d="M6.5 10h-2v7h2v-7zm6 0h-2v7h2v-7zm8.5 9H2v2h19v-2zm-2.5-9h-2v7h2v-7zm-7-6.74L16.71 6H6.29l5.21-2.74m0-2.26L2 6v2h19V6l-9.5-5z" />
          // </svg>

          <svg
            className="side-menu__icon"
            xmlns="http://www.w3.org/2000/svg"
            id="Layer_1"
            data-name="Layer 1"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="M22,5.724V2c0-.552-.447-1-1-1s-1,.448-1,1v2.366L14.797,.855c-1.699-1.146-3.895-1.146-5.594,0L2.203,5.579c-1.379,.931-2.203,2.48-2.203,4.145v9.276c0,2.757,2.243,5,5,5h3c.553,0,1-.448,1-1V15c0-.551,.448-1,1-1h4c.552,0,1,.449,1,1v8c0,.552,.447,1,1,1h3c2.757,0,5-2.243,5-5V9.724c0-1.581-.744-3.058-2-4Zm0,13.276c0,1.654-1.346,3-3,3h-2v-7c0-1.654-1.346-3-3-3h-4c-1.654,0-3,1.346-3,3v7h-2c-1.654,0-3-1.346-3-3V9.724c0-.999,.494-1.929,1.322-2.487L10.322,2.513c1.02-.688,2.336-.688,3.355,0l7,4.724c.828,.558,1.322,1.488,1.322,2.487v9.276Z" />
          </svg>
        ),
        type: "sub",
        selected: false,
        active: false,
        path: `/admin/careyeshousing`,
        type: "link",
      },
    ],
  },
  // {

  //   Items: [
  //     {
  //       // title: "Transactions",
  //       title: "Legacy Transactions",
  //       icon: (
  //         <svg
  //           xmlns="http://www.w3.org/2000/svg"
  //           className="side-menu__icon"
  //           width="24"
  //           height="24"
  //           viewBox="0 0 24 24"
  //         >
  //           <path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13zm7 7v-5h4v5h-4zm2-15.586 6 6V15l.001 5H16v-5c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v5H6v-9.586l6-6z" />
  //         </svg>
  //       ),
  //       type: "sub",
  //       selected: false,
  //       active: false,
  //       path: `/admin/transactions`,
  //       type: "link",
  //     },
  //   ],
  // },
  {
    Items: [
      {
        title: "CMS",
        icon: (
          <svg
            className="side-menu__icon"
            xmlns="http://www.w3.org/2000/svg"
            id="Layer_1"
            data-name="Layer 1"
            height="24"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="M23.9,11.437A12,12,0,0,0,0,13a11.878,11.878,0,0,0,3.759,8.712A4.84,4.84,0,0,0,7.113,23H16.88a4.994,4.994,0,0,0,3.509-1.429A11.944,11.944,0,0,0,23.9,11.437Zm-4.909,8.7A3,3,0,0,1,16.88,21H7.113a2.862,2.862,0,0,1-1.981-.741A9.9,9.9,0,0,1,2,13,10.014,10.014,0,0,1,5.338,5.543,9.881,9.881,0,0,1,11.986,3a10.553,10.553,0,0,1,1.174.066,9.994,9.994,0,0,1,5.831,17.076ZM7.807,17.285a1,1,0,0,1-1.4,1.43A8,8,0,0,1,12,5a8.072,8.072,0,0,1,1.143.081,1,1,0,0,1,.847,1.133.989.989,0,0,1-1.133.848,6,6,0,0,0-5.05,10.223Zm12.112-5.428A8.072,8.072,0,0,1,20,13a7.931,7.931,0,0,1-2.408,5.716,1,1,0,0,1-1.4-1.432,5.98,5.98,0,0,0,1.744-5.141,1,1,0,0,1,1.981-.286Zm-5.993.631a2.033,2.033,0,1,1-1.414-1.414l3.781-3.781a1,1,0,1,1,1.414,1.414Z" />
          </svg>
        ),
        type: "sub",
        selected: false,
        active: false,
        path: `/admin/cms`,
        type: "link",
      },
    ],
  },

  // {
  //     Items: [
  //       {
  //         title: "Email Templates",
  //         icon: (
  //           <svg
  //             className="side-menu__icon"
  //             xmlns="http://www.w3.org/2000/svg"
  //             id="Layer_1"
  //             data-name="Layer 1"
  //             height="24"
  //             viewBox="0 0 24 24"
  //             width="24"
  //           >
  //             <path d="M19.95,5.54l-3.48-3.48c-1.32-1.32-3.08-2.05-4.95-2.05H7C4.24,0,2,2.24,2,5v14c0,2.76,2.24,5,5,5h10c2.76,0,5-2.24,5-5V10.49c0-1.87-.73-3.63-2.05-4.95Zm-1.41,1.41c.32,.32,.59,.67,.81,1.05h-4.34c-.55,0-1-.45-1-1V2.66c.38,.22,.73,.49,1.05,.81l3.48,3.48Zm1.46,12.05c0,1.65-1.35,3-3,3H7c-1.65,0-3-1.35-3-3V5c0-1.65,1.35-3,3-3h4.51c.16,0,.33,0,.49,.02V7c0,1.65,1.35,3,3,3h4.98c.02,.16,.02,.32,.02,.49v8.51Zm-10,0c0,.55-.45,1-1,1h-2c-.55,0-1-.45-1-1v-1c0-.55,.45-1,1-1s1,.45,1,1h1c.55,0,1,.45,1,1Zm8-1v1c0,.55-.45,1-1,1h-2c-.55,0-1-.45-1-1s.45-1,1-1h1c0-.55,.45-1,1-1s1,.45,1,1Zm0-5v1c0,.55-.45,1-1,1s-1-.45-1-1h-1c-.55,0-1-.45-1-1s.45-1,1-1h2c.55,0,1,.45,1,1Zm-8,0c0,.55-.45,1-1,1h-1c0,.55-.45,1-1,1s-1-.45-1-1v-1c0-.55,.45-1,1-1h2c.55,0,1,.45,1,1Zm0-4c0,.55-.45,1-1,1h-2c-.55,0-1-.45-1-1s.45-1,1-1h2c.55,0,1,.45,1,1Z" />
  //           </svg>
  //         ),
  //         type: "sub",
  //         selected: false,
  //         active: false,
  //         path: `/admin/emailtemplate`,
  //         type: "link",
  //       },
  //     ],
  //   },











  {
    Items: [
      {
        title: "Finance",
        icon: (
          <svg
            className="side-menu__icon"
            xmlns="http://www.w3.org/2000/svg"
            id="Layer_1"
            data-name="Layer 1"
            height="24"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="M23,22H5a3,3,0,0,1-3-3V1A1,1,0,0,0,0,1V19a5.006,5.006,0,0,0,5,5H23a1,1,0,0,0,0-2Z" />
            <path d="M6,20a1,1,0,0,0,1-1V12a1,1,0,0,0-2,0v7A1,1,0,0,0,6,20Z" />
            <path d="M10,10v9a1,1,0,0,0,2,0V10a1,1,0,0,0-2,0Z" />
            <path d="M15,13v6a1,1,0,0,0,2,0V13a1,1,0,0,0-2,0Z" />
            <path d="M20,9V19a1,1,0,0,0,2,0V9a1,1,0,0,0-2,0Z" />
            <path d="M6,9a1,1,0,0,0,.707-.293l3.586-3.586a1.025,1.025,0,0,1,1.414,0l2.172,2.172a3,3,0,0,0,4.242,0l5.586-5.586A1,1,0,0,0,22.293.293L16.707,5.878a1,1,0,0,1-1.414,0L13.121,3.707a3,3,0,0,0-4.242,0L5.293,7.293A1,1,0,0,0,6,9Z" />
          </svg>
        ),
        type: "sub",
        selected: false,
        active: false,
        path: `/admin/finance`,
        type: "link",
      },
    ],
  },
  {
    Items: [
      {
        title: "Slider",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" className="side-menu__icon"

            height="24"
            viewBox="0 0 24 24"
            width="24">
            <path d="m12,21c0,.553-.448,1-1,1h-6c-2.757,0-5-2.243-5-5V5C0,2.243,2.243,0,5,0h12c2.757,0,5,2.243,5,5v6c0,.553-.448,1-1,1s-1-.447-1-1v-6c0-1.654-1.346-3-3-3H5c-1.654,0-3,1.346-3,3v6.959l2.808-2.808c1.532-1.533,4.025-1.533,5.558,0l5.341,5.341c.391.391.391,1.023,0,1.414-.195.195-.451.293-.707.293s-.512-.098-.707-.293l-5.341-5.341c-.752-.751-1.976-.752-2.73,0l-4.222,4.222v2.213c0,1.654,1.346,3,3,3h6c.552,0,1,.447,1,1ZM15,3.5c1.654,0,3,1.346,3,3s-1.346,3-3,3-3-1.346-3-3,1.346-3,3-3Zm0,2c-.551,0-1,.448-1,1s.449,1,1,1,1-.448,1-1-.449-1-1-1Zm8,12.5h-3v-3c0-.553-.448-1-1-1s-1,.447-1,1v3h-3c-.552,0-1,.447-1,1s.448,1,1,1h3v3c0,.553.448,1,1,1s1-.447,1-1v-3h3c.552,0,1-.447,1-1s-.448-1-1-1Z" />
          </svg>

        ),
        type: "sub",
        selected: false,
        active: false,
        path: `/admin/slider`,
        type: "link",
      },
    ],
  },

  // {
  //   Items: [
  //     {
  //       title: "Orders",
  //       icon: (
  //         <svg
  //           className="side-menu__icon"
  //           xmlns="http://www.w3.org/2000/svg"
  //           height="24"
  //           viewBox="0 0 24 24"
  //           width="24"
  //         >
  //           <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-5 7c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10zM4.59 11.59l-.59.58V4h11v7H5.17l-.58.59z" />
  //         </svg>
  //       ),
  //       type: "sub",
  //       selected: false,
  //       active: false,
  //       path: `/admin/orders`,
  //       type: "link",
  //     }
  //   ]
  // },
  // {
  //   Items: [
  //     {
  //       title: "Tickets Scanned",
  //       icon: (
  //         <svg
  //           className="side-menu__icon"
  //           xmlns="http://www.w3.org/2000/svg"
  //           height="24"
  //           viewBox="0 0 24 24"
  //           width="24"
  //         >
  //           <path d="M19 3h-2V1H7v2H5c-1.11 0-1.99.89-1.99 2L3 19c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zM9 4h6v4H9V4zm8 14H7v-1h10v1zm0-3H7v-1h10v1zm0-3H7V9h10v3z" />
  //         </svg>
  //       ),
  //       type: "sub",
  //       selected: false,
  //       active: false,
  //       path: "/admin/scannedtickets",
  //       type: "link",
  //     }
  //   ]
  // },
  // {
  //   Items: [
  //     {
  //       title: "Promotion Codes",
  //       icon: (
  //         <svg
  //           className="side-menu__icon"
  //           xmlns="http://www.w3.org/2000/svg"
  //           height="24"
  //           viewBox="0 0 24 24"
  //           width="24"
  //         >
  //           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-12h-2v4H9v2h2v2h2v-2h2v-2h-2v-4zm-1 6h-2v-4h2v4z" />
  //         </svg>
  //       ),
  //       type: "sub",
  //       selected: false,
  //       active: false,
  //       path: "/admin/promotioncodes",
  //       type: "link",
  //     }]
  // },

  // {
  //   Items: [
  //     {
  //       title: "Staff",
  //       icon: (
  //         <svg
  //           className="side-menu__icon"
  //           xmlns="http://www.w3.org/2000/svg"
  //           height="24"
  //           viewBox="0 0 24 24"
  //           width="24"
  //         >
  //           <path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 4c.22-.72 3.31-2 6-2 2.7 0 5.8 1.29 6 2H6zm6-6c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
  //         </svg>
  //       ),
  //       type: "sub",
  //       selected: false,
  //       active: false,
  //       path: `/admin/staff`,
  //       type: "link",
  //     },
  //   ],
  // },
];
