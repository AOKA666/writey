type IconProps = { className?: string; size?: number; title?: string };

export function IconPen({ className, size = 20, title }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <path d="M4 20h16M5.5 16.5c1.8-2.6 3.8-7.2 5.6-10.1.3-.5 1-.7 1.5-.3l1.4.9c.5.3.6 1 .3 1.5-1.8 2.7-4.6 7-6.4 9.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.6 6.6l2.4 1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function IconMenu({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function IconClose({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function IconLock({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function IconCheck({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5l5 5 9-11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconEditNote({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h16M6 16.5V6.5A1.5 1.5 0 0 1 7.5 5h6.2L18 9.2V16.5A1.5 1.5 0 0 1 16.5 18h-9A1.5 1.5 0 0 1 6 16.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M13.5 5v4.2H18M8.5 12.2h5M8.5 15h3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconTranslate({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5h9M8.5 5v2M6 17h5l-1-3M7 11c.8 2 2.4 4.6 5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 19h7M16.2 8.5h5.3M18.8 8.5c-.3 2.3-1.6 5.4-4.3 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconLanguage({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M4.5 12h15M12 3.8c2.2 2.4 3.4 5.2 3.4 8.2s-1.2 5.8-3.4 8.2M12 3.8C9.8 6.2 8.6 9 8.6 12s1.2 5.8 3.4 8.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function IconLined({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14M5 12h14M5 17h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function IconBlank({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6.5" y="3.5" width="11" height="17" rx="1.2" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

export function IconGrid({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 8.5h14M5 13h14M5 17.5h14M8.5 5v14M13 5v14M17.5 5v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconDraw({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h7l9.2-9.2a2.1 2.1 0 0 0 0-3L17.2 4.8a2.1 2.1 0 0 0-3 0L5 14v6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M13.2 5.8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function IconPdf({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3.5h7.2L19 8.2V20a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5H7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M14 3.8V8h4.2M8.2 16.2h2.1a1.4 1.4 0 0 0 0-2.8H8.2V12M13.2 12v4.2m0-4.2h1.3a1.5 1.5 0 0 1 0 3H13.2M17.4 16.2V12h1.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconImage({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M4.8 16.5l4.2-4.2 3.2 3.2 2.2-2.2 4.8 4.2" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <circle cx="9" cy="9.2" r="1.2" fill="currentColor"/>
    </svg>
  );
}

export function IconShield({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 5.5 6.2v5.3c0 4.2 2.8 7.4 6.5 8.8 3.7-1.4 6.5-4.6 6.5-8.8V6.2L12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M9.2 12.1 11 14l3.8-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconSync({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 12a8 8 0 0 0-13.7-5.6L5 8.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 5v3.2h3.2M4 12a8 8 0 0 0 13.7 5.6L19 15.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 19v-3.2h-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
