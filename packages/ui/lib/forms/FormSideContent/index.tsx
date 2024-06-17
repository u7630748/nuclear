import React from 'react';

import styles from './styles.scss';

export type FormSideContentProps = {
  children: React.ReactNode;
}

export const FormSideContent: React.FC<FormSideContentProps> = ({
  children
}) => <div className={'nuclear ' + styles.form_side_content}>
  {children}
</div>;
