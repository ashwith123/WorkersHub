export default function Footer() {
  return (
    <footer className="footclass border-top">
      <div className="my-info">
        <a href="">
          <i className="fa-brands fa-instagram"></i>
        </a>

        <a href="">
          <i className="fa-brands fa-github"></i>
        </a>

        <a href="">
          <i className="fa-brands fa-linkedin"></i>
        </a>
      </div>

      <div className="name">
        BookMyHotel private limited
      </div>

      <div className="links">
        <a href="/privacy">privacy</a>
        <a href="/terms">terms</a>
      </div>
    </footer>
  );
}