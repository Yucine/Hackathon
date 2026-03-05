import React, { useEffect } from 'react';

const SectionPage = ({ title, children }) => {
  useEffect(() => {
    document.title = `${title} | МТС Cloud`;
  }, [title]);

  return (
    <>
      <div className="section-header">
        <h2>{title}</h2>
      </div>
      {children}
    </>
  );
};

export default SectionPage;