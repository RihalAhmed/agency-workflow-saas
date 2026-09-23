/**
 * Shared Primitives Library
 *
 * Every design imports from this barrel export.
 * One fix propagates everywhere instead of being copy-pasted per design.
 */

export { PrimitiveButton } from "./Button";
export type { PrimitiveButtonProps } from "./Button";

export { PrimitiveCard } from "./Card";
export type { PrimitiveCardProps } from "./Card";

export { PrimitiveBadge } from "./Badge";
export type { PrimitiveBadgeProps } from "./Badge";

export { PrimitiveTestimonial } from "./Testimonial";
export type { PrimitiveTestimonialProps } from "./Testimonial";

export { PrimitiveFormInput, PrimitiveFormSelect } from "./FormInput";
export type { PrimitiveFormInputProps, PrimitiveFormSelectProps } from "./FormInput";

export { PrimitiveReviewStars } from "./ReviewStars";
export type { PrimitiveReviewStarsProps } from "./ReviewStars";

export { PrimitiveTrustBadge } from "./TrustBadge";
export type { PrimitiveTrustBadgeProps } from "./TrustBadge";
