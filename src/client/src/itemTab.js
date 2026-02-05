import React, {useState, useEffect} from 'react';
import Item from './item'
import './itemTab.css'

const ItemTab = ({curItemData, onItemSelect, selectedItem, searchedValue, setSearchedValue, searchedOption, setSearchedOption}) => {

    const [items, setItems] = useState([]);

    useEffect(() => {
        setItems(curItemData);
        if(searchedValue != '') {
            handleSearch(searchedOption, searchedValue);
        } else {
            handleSearch('timestamp', '{');
        }
    });

    const handlerKeyDown = (event) => {
        if(event.key == 'Enter') {
            handleSearch(searchedOption, searchedValue)
        }
    }

    const handleSearch = (searchedOption, searchedValue) => {

        setItems(prevItems => {
            const itemsCopy = [...prevItems];
            itemsCopy.forEach((item) => {
                if (item[searchedOption].includes(searchedValue)) {
                    item.searched = true;
                } else {
                    item.searched = false;
                }
            });
            return itemsCopy;
        })
    }

    return (
        <div>
            <div className="search-item-container">
                <select class="search-item-select"
                        value={searchedOption}
                        onChange={(e) => setSearchedOption(e.target.value)}>
                    <option value="id">ID</option>
                    <option value="type">type</option>
                    <option value="name">name</option>
                </select>
                <input className="search-item-input"
                        type="text"
                        placeholder="Search"
                        onKeyDown={handlerKeyDown}
                        value={searchedValue}
                        onChange={(e) => setSearchedValue(e.target.value)}>

                        </input>
            </div>
        {
        items.map(data => (
            selectedItem.findIndex((highlight) => highlight.id == data.id) == -1 ?
            (
            <Item itemData={data}
                         onItemSelect={onItemSelect}
                         selected={false}
                         />
            )
            :
            (
                <Item itemData={data}
                        onItemSelect={onItemSelect}
                        selected={true}
                        />

            )
        ))
        }

        <p>itemTab bottom</p>
        </div>
    );
};

export default ItemTab;