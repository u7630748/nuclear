import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import _ from 'lodash';
import { Dropdown, DropdownItemProps, DropdownHeaderProps, DropdownDividerProps } from 'semantic-ui-react';
import artPlaceholder from '../../../resources/media/art_placeholder.png';
import common from '../../common.scss';
import styles from './styles.scss';

export type CardMenuEntry = {
  type: 'header' | 'item' | 'divider';
  props?: DropdownItemProps | DropdownHeaderProps | DropdownDividerProps;
};

type CardProps = {
  header: string;
  content?: string;
  image?: string;
  onClick?: React.MouseEventHandler;
  withMenu?: boolean;
  animated?: boolean;
  menuEntries?: CardMenuEntry[];
  className?: string;
  'data-testid'?: string;
};

const Card: React.FC<CardProps> = ({
  header,
  content,
  image,
  onClick,
  withMenu = false,
  animated = true,
  menuEntries,
  className,
  'data-testid': dataTestId
}) => {
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const menuPlaceholderRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    if (menuPlaceholderRef.current && cardRef.current) {
      const placeholderRect = menuPlaceholderRef.current.getBoundingClientRect();
      const cardRect = cardRef.current.getBoundingClientRect();
      setMenuPosition({
        top: placeholderRect.top - cardRect.top,
        right: cardRect.right - placeholderRect.right
      });
    }
  }, []);

  useEffect(() => {
    if (!withMenu) return;

    const observer = new MutationObserver(updateMenuPosition);
    const resizeObserver = new ResizeObserver(updateMenuPosition);

    if (cardRef.current) {
      observer.observe(cardRef.current, { 
        attributes: true, 
        childList: true, 
        subtree: true 
      });
      resizeObserver.observe(cardRef.current);
    }

    window.addEventListener('scroll', updateMenuPosition);
    window.addEventListener('resize', updateMenuPosition);

    updateMenuPosition();

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateMenuPosition);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [withMenu, updateMenuPosition]);

  const handleMouseEnter = () => setIsMenuVisible(true);
  const handleMouseLeave = () => setIsMenuVisible(false);

  const renderMenu = () => {
    if (!withMenu || !isMenuVisible) return null;

    return ReactDOM.createPortal(
      <div 
        className={styles.portal_menu}
        style={{ 
          top: `${menuPosition.top}px`, 
          right: `${menuPosition.right}px`,
          position: 'absolute'
        }}
      >
        <Dropdown
          basic
          icon='ellipsis vertical'
          className={styles.menu_button}
        >
          <Dropdown.Menu>
            {_.isArray(menuEntries) && !_.isEmpty(menuEntries) &&
              menuEntries.map((entry, i) => {
                switch (entry.type) {
                  case 'header':
                    return <Dropdown.Header key={`header-${i}`} {...entry.props} />;
                  case 'item':
                    return <Dropdown.Item key={`item-${i}`} {...entry.props} />;
                  case 'divider':
                    return <Dropdown.Divider key={`divider-${i}`} />;
                }
              })
            }
          </Dropdown.Menu>
        </Dropdown>
      </div>,
      cardRef.current as Element
    );
  };

  return (
    <div 
      ref={cardRef}
      className={cx(
        common.nuclear,
        styles.card_container,
        className
      )}
      data-testid={dataTestId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cx(
          styles.card,
          { [styles.animated]: animated }
        )}
        onClick={onClick}
      >
        {withMenu && 
          <div ref={menuPlaceholderRef} className={styles.menu_placeholder} />
        }
        <div className={styles.thumbnail}
          style={{ backgroundImage: `url('${(_.isNil(image) || _.isEmpty(image)) ? artPlaceholder : image}')` }}
        >
          <div className={styles.overlay} />
        </div>
        <div className={styles.card_content}>
          <h4>{header}</h4>
          {!_.isNil(content) && <p>{content}</p>}
        </div>
      </div>
      {renderMenu()}
    </div>
  );
};

export default Card;
