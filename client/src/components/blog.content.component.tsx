import React from "react"

interface Block {
  type: string
  data: {
    text?: string
    level?: number
    file?: {
      url: string
    }
    caption?: string
    style?: string
    items?: string[]
  }
}

interface BlogContentProps {
  block: Block
}

interface ImgProps {
  url: string
  caption: string
}

interface QuoteProps {
  quote: string
  caption: string
}

interface ListProps {
  style: "ordered" | "unordered"
  items: string[]
}

const Img: React.FC<ImgProps> = ({ url, caption }) => {
  return (
    <div>
      <img src={url} alt='' />
      {caption.length ? (
        <p className='w-100 text-center my-3 mb-md-3 text-base text-muted'>
          {caption}
        </p>
      ) : (
        ""
      )}
    </div>
  )
}

const Quote: React.FC<QuoteProps> = ({ quote, caption }) => {
  return (
    <div
      className='p-3 pl-5'
      style={{
        backgroundColor: "rgba(138, 70, 255, 0.37)",
        borderLeft: "4px solid #8B46FF",
      }}
    >
      <p className='m-0 fs-5 lh-1.5 fs-md-3'>{quote}</p>
      {caption.length ? (
        <p className='m-0 w-100 text-muted' style={{ color: "#8B46FF" }}>
          {caption}
        </p>
      ) : (
        ""
      )}
    </div>
  )
}

const List: React.FC<ListProps> = ({ style, items }) => {
  return (
    <ol
      className={`pl-5 ${style === "ordered" ? " list-decimal" : " list-disc"}`}
    >
      {items.map((listItem, i) => {
        return (
          <li
            key={i}
            className='my-2'
            dangerouslySetInnerHTML={{ __html: listItem }}
          ></li>
        )
      })}
    </ol>
  )
}

const BlogContent: React.FC<BlogContentProps> = ({ block }) => {
  let { type, data } = block

  if (type === "paragraph") {
    return <p dangerouslySetInnerHTML={{ __html: data.text || "" }}></p>
  }
  if (type === "header") {
    if (data.level === 3) {
      return (
        <h3
          className='fw-bold fs-3'
          dangerouslySetInnerHTML={{ __html: data.text || "" }}
        ></h3>
      )
    }
    return (
      <h2
        className='fw-bold fs-2'
        dangerouslySetInnerHTML={{ __html: data.text || "" }}
      ></h2>
    )
  }

  if (type === "image") {
    return <Img url={data.file?.url || ""} caption={data.caption || ""} />
  }
  if (type === "quote") {
    return <Quote quote={data.text || ""} caption={data.caption || ""} />
  }
  if (type === "list") {
    return (
      <List
        style={data.style as "ordered" | "unordered"}
        items={data.items || []}
      />
    )
  }

  // Return null if no matching block type is found
  return null
}

export default BlogContent
