import { useRouter } from "next/router";
import Head from "next/head";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import styles from "@/styles/Custom404.module.css";

export default function Custom404() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <>
      <Head>
        <title>Page Not Found - eboxtickets</title>
        <meta name="description" content="Oops! Page not found." />
      </Head>

      {/* Header */}
      <FrontendHeader />

      {/* 404 Content */}
      <div className={styles.container}>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.errorTitle}>Page Not Found</h2>
        <p className={styles.errorMessage}>
          Our bird tried to find it, but could not. Maybe this page doesn't exist.
        </p>
        <button className={styles.homeBtn} onClick={handleGoHome}>
          Back to Home
        </button>
      </div>

      {/* Footer */}
      <FrontendFooter />
    </>
  );
}
