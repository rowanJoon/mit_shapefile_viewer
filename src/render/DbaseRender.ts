export class DbaseRender {
    public expressionDbaseData(dbaseData: { shapeType: number, dbaseData: string | number }[]): void {
        const jsonTextField: HTMLInputElement = document.getElementById('featureInfoArea') as HTMLInputElement;
        let jsonData: { data: { [key: string]: string | number } } = { data: {} };

        if (!dbaseData) {
            jsonData.data['message'] = 'dbf 파일을 선택하세요.';
        } else {
            for (let i = 0; i < dbaseData.length; i++) {
                let dbaseDataName: string = '';

                switch (dbaseData[i].shapeType) {
                    case 1:
                        dbaseDataName = 'point';
                        break;
                    case 3:
                        dbaseDataName = 'polyline';
                        break;
                    case 5:
                        dbaseDataName = 'polygon';
                        break;
                }

                if (dbaseDataName !== '') {
                    jsonData.data[dbaseDataName] = dbaseData[i].dbaseData;
                }
            }
        }

        jsonTextField.value = JSON.stringify(jsonData, null, 2);
    }
}