export default function Banner({ type = 'error', children }) {
  if (!children) {
    return null;
  }
  return (
    <div className={`banner banner-${type}`} role="status">
      {children}
    </div>
  );
}
