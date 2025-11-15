import Head from 'next/head';

const AftonTicketsButton = () => {
  return (
    <>
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function (a, f, t, o, n, js, fjs) {
                a[o] = a[o] || function () { (a[o].q = a[o].q || []).push(arguments) };
                js = f.createElement(t);
                fjs = f.getElementsByTagName(t)[0];
                js.id = o;
                js.src = n;
                js.async = 1;
                fjs.parentNode.insertBefore(js, fjs);
              }(window, document, 'script', '_aft', 'https://cdn1.aftontickets.com/js/embedded-checkout/widget.js'));

              _aft('init', { apiKey: 'f569dd799b3aefb7019ee51ff24d9bab', debug: false });
            `,
          }}
        />
      </Head>
      <button className="afton-tickets-checkout-button btn btn-dark  mb-0 w-30 rounded-0" data-event-id="nvjq72p9op">
        Tickets
      </button>
    </>
  );
};

export default AftonTicketsButton;