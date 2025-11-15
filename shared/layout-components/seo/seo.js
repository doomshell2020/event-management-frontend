import React from 'react'
import Head from "next/head"

const Seo = ({ title }) => {
  let i = `${title}`
  return (
    <Head>
      <title>{i}</title>
      
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap" rel="stylesheet"></link>
      <link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@500&display=swap" rel="stylesheet"></link>

      <meta name="description" content="ONDALINDA x MONTENEGRO is a four day celebration featuring a weekend of one of a kind, multi-sensory experiences. Experiences tilled with community, music, art, performances, and culture. All embraced by Mon­tenegro's powerful energy, diverse culture, rich history, and surreal, breath-taking landscapes." />
      <meta name="author" content="ONDALINDA" />
      <meta name="keywords" content="ONDALINDA, Montenegro, celebration, community, music, art, performances, culture, landscapes" />


    </Head>
  )
}

export default Seo