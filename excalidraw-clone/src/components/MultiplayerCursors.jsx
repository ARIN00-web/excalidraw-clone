import React from 'react';
import { Group, Ellipse, Rect, Text } from 'react-konva';

function MultiplayerCursors({ cursors }) {
    return (
        <>
            {Object.keys(cursors).map(clientId => {
                const cursor = cursors[clientId];
                if (!cursor || !cursor.cursor) return null;

                return (
                    <Group key={clientId} x={cursor.cursor.x} y={cursor.cursor.y}>
                        {/* A cute little circular mouse pointer */}
                        <Ellipse
                            radiusX={8}
                            radiusY={8}
                            fill={cursor.color}
                            stroke="white"
                            strokeWidth={2}
                            shadowColor="black"
                            shadowBlur={4}
                            shadowOpacity={0.3}
                        />
                        {/* The user's name badge */}
                        <Rect
                            x={10}
                            y={10}
                            width={cursor.name.length * 8 + 10}
                            height={20}
                            fill={cursor.color}
                            cornerRadius={4}
                        />
                        <Text
                            x={15}
                            y={14}
                            text={cursor.name}
                            fill="white"
                            fontSize={12}
                            fontStyle="bold"
                        />
                    </Group>
                );
            })}
        </>
    );
}

export default MultiplayerCursors;
