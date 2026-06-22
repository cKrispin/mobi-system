export async function askAI(prompt){

    console.log(
        "Mock AI received:",
        prompt
    );

    const responses = [

        "Traffic congestion detected. Suggested alternative route available.",

        "No incidents reported on this route.",

        "Estimated arrival time: 18 minutes.",

        "Heavy traffic ahead. Consider using Route B.",

        "Transport analysis completed successfully."

    ];

    const randomIndex =
        Math.floor(
            Math.random() *
            responses.length
        );

    return responses[
        randomIndex
    ];

}