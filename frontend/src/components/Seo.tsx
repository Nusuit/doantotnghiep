import React from "react";
import { Helmet } from "react-helmet";

export default function Seo({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
}
