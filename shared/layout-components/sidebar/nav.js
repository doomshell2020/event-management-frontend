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
        title: "Event Organizer",
        icon: (
          // <svg
          //   className="side-menu__icon"
          //   xmlns="http://www.w3.org/2000/svg"
          //   id="Layer_1"
          //   data-name="Layer 1"
          //   height="24"
          //   viewBox="0 0 24 24"
          //   width="24"
          // >
          //   <path d="M12.006,12.309c3.611-.021,5.555-1.971,5.622-5.671-.062-3.56-2.111-5.614-5.634-5.637-3.561,.022-5.622,2.17-5.622,5.637,0,3.571,2.062,5.651,5.634,5.672Zm-.012-9.309c2.437,.016,3.591,1.183,3.634,3.636-.047,2.559-1.133,3.657-3.622,3.672-2.495-.015-3.582-1.108-3.634-3.654,.05-2.511,1.171-3.639,3.622-3.654Z" />
          //   <path d="M11.994,13.661c-5.328,.034-8.195,2.911-8.291,8.322-.01,.552,.43,1.008,.982,1.018,.516-.019,1.007-.43,1.018-.982,.076-4.311,2.08-6.331,6.291-6.357,4.168,.027,6.23,2.106,6.304,6.356,.01,.546,.456,.983,1,.983h.018c.552-.01,.992-.465,.983-1.017-.092-5.333-3.036-8.288-8.304-8.322Z" />
          // </svg>

          <svg
            className="side-menu__icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="M16 11a4 4 0 10-4-4 4 4 0 004 4zM8 11a3 3 0 10-3-3 3 3 0 003 3zm8 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-8 1c-.29 0-.62.02-.97.05C5.17 14.4 2 15.74 2 18v1h4v-1.5c0-1.53.84-2.73 2-3.5z" />
          </svg>


        ),
        type: "link",
        selected: false,
        active: false,
        path: `/admin/event-organizers`,
      },
    ]
  },

 {
    Items: [
      {
        title: "Customer Manager",
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
        type: "link",
        selected: false,
        active: false,
        path: `/admin/customer`,
      },
    ]
  },




  {
    Items: [
      {
        title: "Event Manager",
        icon: (
          <svg
            className="side-menu__icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 18H5V8h14v13z" />
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
        title: "Order Manager",
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
            <path d="M19.95,5.54l-3.48-3.48c-1.32-1.32-3.08-2.05-4.95-2.05H7C4.24,0,2,2.24,2,5v14c0,2.76,2.24,5,5,5h10c2.76,0,5-2.24,5-5V10.49c0-1.87-.73-3.63-2.05-4.95Zm-1.41,1.41c.32,.32,.59,.67,.81,1.05h-4.34c-.55,0-1-.45-1-1V2.66c.38,.22,.73,.49,1.05,.81l3.48,3.48Zm1.46,12.05c0,1.65-1.35,3-3,3H7c-1.65,0-3-1.35-3-3V5c0-1.65,1.35-3,3-3h4.51c.16,0,.33,0,.49,.02V7c0,1.65,1.35,3,3,3h4.98c.02,.16,.02,.32,.02,.49v8.51Zm-10,0c0,.55-.45,1-1,1h-2c-.55,0-1-.45-1-1v-1c0-.55,.45-1,1-1s1,.45,1,1h1c.55,0,1,.45,1,1Zm8-1v1c0,.55-.45,1-1,1h-2c-.55,0-1-.45-1-1s.45-1,1-1h1c0-.55,.45-1,1-1s1,.45,1,1Zm0-5v1c0,.55-.45,1-1,1s-1-.45-1-1h-1c-.55,0-1-.45-1-1s.45-1,1-1h2c.55,0,1,.45,1,1Zm-8,0c0,.55-.45,1-1,1h-1c0,.55-.45,1-1,1s-1-.45-1-1v-1c0-.55,.45-1,1-1h2c.55,0,1,.45,1,1Zm0-4c0,.55-.45,1-1,1h-2c-.55,0-1-.45-1-1s.45-1,1-1h2c.55,0,1,.45,1,1Z" />
          </svg>
        ),
        type: "sub",
        selected: false,
        active: false,
        path: `/admin/orders`,
        type: "link",
      },
    ],
  },

  {
    Items: [
      {
        title: "Ticket Manager",
        icon: (
          <svg
            className="side-menu__icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="M22 10V6a2 2 0 00-2-2H4a2 2 0 00-2 2v4a2 2 0 110 4v4a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 110-4zm-5-2h-2V6h2v2zm0 10h-2v-2h2v2z" />
          </svg>

        ),
        type: "sub",
        selected: false,
        active: false,
        path: `/admin/tickets`,
        type: "link",
      },
    ],
  },

  {
    Items: [
      {
        title: "Static Manager",
        icon: (
          <svg
            className="side-menu__icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="M4 2h12l4 4v16H4V2zm12 1.5V7h3.5L16 3.5zM6 10h12v2H6v-2zm0 4h12v2H6v-2zm0 4h8v2H6v-2z" />
          </svg>

        ),
        type: "sub",
        selected: false,
        active: false,
        path: `/admin/static`,
        type: "link",
      },
    ],
  },
  {
    Items: [
      {
        title: "Contact Us",
        icon: (
          <svg
            className="side-menu__icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="M21 15.5a16.9 16.9 0 01-5.3-.8 1 1 0 00-1 .2l-2.3 1.7a15.1 15.1 0 01-6.8-6.8l1.7-2.3a1 1 0 00.2-1A16.9 16.9 0 016.5 3H4a1 1 0 00-1 1A17 17 0 0020 20a1 1 0 001-1v-2.5z" />
          </svg>

        ),
        type: "sub",
        selected: false,
        active: false,
        path: `/admin/contact-us`,
        type: "link",
      },
    ],
  },
  {
    Items: [
      {
        title: "Email Templates",
        icon: (
          <svg
            className="side-menu__icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="M2 4h20v16H2V4zm10 7l8-5H4l8 5zm0 2l-8-5v10h16V8l-8 5z" />
          </svg>

        ),
        type: "sub",
        selected: false,
        active: false,
        path: `/admin/email-templates`,
        type: "link",
      },
    ],
  },
  {
    Items: [
      {
        title: "Seo Manager",
        icon: (
          <svg
            className="side-menu__icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="M10 2a8 8 0 105.3 14l4.4 4.4 1.4-1.4-4.4-4.4A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z" />
          </svg>

        ),
        type: "sub",
        selected: false,
        active: false,
        path: `/admin/seo`,
        type: "link",
      },
    ],
  },

];
