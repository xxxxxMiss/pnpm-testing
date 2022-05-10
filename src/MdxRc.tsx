import { Typography } from 'antd'

const { Paragraph, Link } = Typography

export const PRef = ({ children }) => {
  return (
    <Paragraph>
      <blockquote>{children}</blockquote>
    </Paragraph>
  )
}

export default {
  PRef,
  Link,
}
