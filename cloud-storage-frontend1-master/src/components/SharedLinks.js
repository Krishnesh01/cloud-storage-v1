import React from 'react';

function SharedLinks() {

    const links = JSON.parse(

        localStorage.getItem(
            'sharedLinks'
        )

    ) || [];

    return (

        <div className="files-section">

            <h2>
                Shared Links
            </h2>

            {
                links.length === 0 && (

                    <p>
                        No shared links yet.
                    </p>
                )
            }

            {
                links.map((item, index) => (

                    <div
                        className="file-card"
                        key={index}
                    >

                        <p>
                            {item.file}
                        </p>

                        <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                color: '#22c55e'
                            }}
                        >
                            Open Link
                        </a>

                    </div>
                ))
            }

        </div>
    );
}

export default SharedLinks;