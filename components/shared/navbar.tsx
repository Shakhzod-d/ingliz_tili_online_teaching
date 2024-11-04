import Link from 'next/link';

const Navbar = () => {
  return (
    <nav>
      <Link href={'/'}>Home</Link>

      <Link href={'/auth/sign-in'}>Login</Link>
      <Link href={'/auth/sign-up'}>Register</Link>
    </nav>
  );
};

export default Navbar;
